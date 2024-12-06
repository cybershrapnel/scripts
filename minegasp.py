import requests
import json
import hashlib
import multiprocessing
import os
import time

# Configuration
RPC_URL = "http://127.0.0.1:15782"
RPC_USER = "nanocheeze"
RPC_PASS = "ncz"

# Global variable to track hashes
hash_count = multiprocessing.Value('i', 0)


def rpc_request(method, params=None):
    """Send an RPC request to the node."""
    headers = {'Content-Type': 'application/json'}
    payload = {
        "jsonrpc": "1.0",
        "id": "mining",
        "method": method,
        "params": params or []
    }
    response = requests.post(RPC_URL, headers=headers, data=json.dumps(payload), auth=(RPC_USER, RPC_PASS))
    if response.status_code == 200:
        return response.json()['result']
    else:
        print(f"RPC Error: {response.status_code} {response.text}")
        return None


def double_sha256(data):
    """Perform a double SHA-256 hash on the data."""
    return hashlib.sha256(hashlib.sha256(data).digest()).digest()


def calculate_merkle_root(transactions):
    """Calculate the Merkle root from transaction hashes."""
    tx_hashes = [bytes.fromhex(tx['hash'])[::-1] for tx in transactions]
    while len(tx_hashes) > 1:
        if len(tx_hashes) % 2 != 0:
            tx_hashes.append(tx_hashes[-1])  # Duplicate the last hash if the count is odd
        tx_hashes = [
            double_sha256(tx_hashes[i] + tx_hashes[i + 1]) for i in range(0, len(tx_hashes), 2)
        ]
    return tx_hashes[0][::-1].hex()


def log_hashrate(hash_count):
    """Log the hash rate periodically."""
    last_count = 0
    while True:
        time.sleep(1)
        with hash_count.get_lock():
            current_count = hash_count.value
        hashes_per_second = current_count - last_count
        last_count = current_count
        print(f"Current Hashrate: {hashes_per_second} H/s")


def mine_nonce_range(template, start_nonce, end_nonce, result_queue, hash_count):
    """Mine a block in a specific nonce range."""
    target = int(template['target'], 16)
    merkle_root = calculate_merkle_root(template['transactions'])
    header = (
        f"{template['version']:08x}"
        f"{template['previousblockhash']}"
        f"{merkle_root}"
        f"{template['curtime']:08x}"
        f"{template['bits']}"
    )
    for nonce in range(start_nonce, end_nonce):
        full_header = f"{header}{nonce:08x}"
        hash_result = double_sha256(bytes.fromhex(full_header))
        with hash_count.get_lock():
            hash_count.value += 1  # Increment the global hash count
        if int.from_bytes(hash_result, byteorder='big') < target:
            result_queue.put(f"{header}{nonce:08x}")  # Found a valid block
            return
    result_queue.put(None)  # No valid block found in this range


def mine_block_multicore(template, num_cores):
    """Split the mining work across multiple cores."""
    result_queue = multiprocessing.Queue()
    nonce_range = 0xFFFFFFFF // num_cores
    processes = []

    # Start the mining processes
    for i in range(num_cores):
        start_nonce = i * nonce_range
        end_nonce = (i + 1) * nonce_range if i < num_cores - 1 else 0xFFFFFFFF
        p = multiprocessing.Process(target=mine_nonce_range, args=(template, start_nonce, end_nonce, result_queue, hash_count))
        processes.append(p)
        p.start()

    # Start the hash rate logger as a separate process
    hashrate_process = multiprocessing.Process(target=log_hashrate, args=(hash_count,))
    hashrate_process.start()

    # Wait for a valid result or for all processes to finish
    result = None
    while result is None and any(p.is_alive() for p in processes):
        while not result_queue.empty():
            result = result_queue.get()
            if result:  # Found a valid block
                break

    # Terminate all processes once a result is found
    for p in processes:
        p.terminate()
    hashrate_process.terminate()

    return result


def submit_block(block_data):
    """Submit the mined block."""
    result = rpc_request("submitblock", [block_data])
    if result is None:
        print("Block submitted successfully.")
    else:
        print(f"Error submitting block: {result}")


def main():
    # Get block template
    template = rpc_request("getblocktemplate", [{"capabilities": ["proposal"]}])
    if not template:
        print("Failed to retrieve block template.")
        return

    # Determine number of cores
    num_cores = 12
    print(f"Using {num_cores} cores for mining...")

    # Mine the block
    print("Mining block...")
    mined_block = mine_block_multicore(template, num_cores)
    if not mined_block:
        print("Failed to mine block.")
        return

    print("Block mined. Submitting...")
    submit_block(mined_block)


if __name__ == "__main__":
    main()
