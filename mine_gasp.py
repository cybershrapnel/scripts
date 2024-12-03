import requests
import json
import hashlib

# Configuration
RPC_URL = "http://127.0.0.1:15782"
RPC_USER = "nanocheeze"
RPC_PASS = "ncz"

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

def mine_block(template):
    """Mine a block using the template."""
    target = int(template['target'], 16)
    merkle_root = calculate_merkle_root(template['transactions'])
    header = (
        f"{template['version']:08x}"
        f"{template['previousblockhash']}"
        f"{merkle_root}"
        f"{template['curtime']:08x}"
        f"{template['bits']}"
        f"0000000000000000000000000000000000000000000000000000000000000000"  # Nonce placeholder
    )
    nonce = 0
    while nonce < 0xFFFFFFFF:
        full_header = f"{header}{nonce:08x}"  # Keep this as a string
        hash_result = double_sha256(bytes.fromhex(full_header))  # Convert it to bytes
        if int.from_bytes(hash_result, byteorder='big') < target:
            return f"{header}{nonce:08x}"  # Return the full block header
        nonce += 1
    return None


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
    
    # Mine the block
    print("Mining block...")
    mined_block = mine_block(template)
    if not mined_block:
        print("Failed to mine block.")
        return
    
    print("Block mined. Submitting...")
    submit_block(mined_block)

if __name__ == "__main__":
    main()
