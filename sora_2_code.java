import java.awt.AWTException;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.datatransfer.StringSelection;
import java.awt.datatransfer.Clipboard;
import java.awt.event.KeyEvent;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;
import java.io.IOException;

public class ClipboardPasterRobot {

    // Interval timings in milliseconds
    private static final int BEFORE_START_DELAY_MS = 3000; // give you time to focus the target window
    private static final int BETWEEN_ACTIONS_MS = 250;     // 0.25s between paste and enter and between cycles

    private final Robot robot;
    private final Clipboard clipboard;
    private final Random random = new Random();
    private final boolean isMac;
    private final AtomicBoolean stopFlag = new AtomicBoolean(false);

    public ClipboardPasterRobot() throws AWTException {
        robot = new Robot();
        clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
        String os = System.getProperty("os.name").toLowerCase();
        isMac = os.contains("mac") || os.contains("darwin");
    }

    private String generateCode() {
        String digits = "0123456789";
        String letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        char d1 = digits.charAt(random.nextInt(digits.length()));
        char l1 = letters.charAt(random.nextInt(letters.length()));
        char d2 = digits.charAt(random.nextInt(digits.length()));
        char l2 = letters.charAt(random.nextInt(letters.length()));
        char l3 = letters.charAt(random.nextInt(letters.length()));
        char d3 = digits.charAt(random.nextInt(digits.length()));
        return new StringBuilder()
                .append(d1).append(l1).append(d2).append(l2).append(l3).append(d3)
                .toString();
    }

    private void copyToClipboard(String text) {
        StringSelection sel = new StringSelection(text);
        clipboard.setContents(sel, null);
    }

    private void pasteFromClipboardAndEnter() {
        // Press modifier + V (control on Windows/Linux, meta on Mac), release, wait, press Enter
        int modKey = isMac ? KeyEvent.VK_META : KeyEvent.VK_CONTROL;

        // press modifier
        robot.keyPress(modKey);
        // press V
        robot.keyPress(KeyEvent.VK_V);
        robot.keyRelease(KeyEvent.VK_V);
        // release modifier
        robot.keyRelease(modKey);

        // small wait
        robot.delay(BETWEEN_ACTIONS_MS);

        // press Enter
        robot.keyPress(KeyEvent.VK_ENTER);
        robot.keyRelease(KeyEvent.VK_ENTER);
    }

    public void startLoop() {
        System.out.println("Starting in " + (BEFORE_START_DELAY_MS / 1000.0) + " seconds. Focus the window/input you want to paste into.");
        try {
            Thread.sleep(BEFORE_START_DELAY_MS);
        } catch (InterruptedException ignored) {}

        int attempt = 0;
        while (!stopFlag.get()) {
            attempt++;
            String code = generateCode();
            copyToClipboard(code);
            System.out.println("[" + attempt + "] Copied code: " + code);

            // give clipboard a tiny moment (usually instantaneous) then paste+enter
            robot.delay(50);
            pasteFromClipboardAndEnter();

            // wait between cycles
            try {
                Thread.sleep(BETWEEN_ACTIONS_MS);
            } catch (InterruptedException ignored) {}
        }

        System.out.println("Stopped. Total attempts: " + attempt);
    }

    public void stop() {
        stopFlag.set(true);
    }

    public static void main(String[] args) throws AWTException, IOException {
        ClipboardPasterRobot app = new ClipboardPasterRobot();

        // Thread to read console input; pressing ENTER will stop the loop
        Thread stopper = new Thread(() -> {
            System.out.println("Press ENTER in this console to stop.");
            try {
                // read until newline
                while (System.in.read() != '\n') {
                    // consume until newline
                }
            } catch (IOException e) {
                // ignore
            }
            app.stop();
        }, "StopperThread");
        stopper.setDaemon(true);
        stopper.start();

        // Start the paste loop (blocks until stopped)
        app.startLoop();
    }
}
