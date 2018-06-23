






// 1,2 并行，1跑到5时候等待，2结束的时候1停止等待接着开始跑

```
package java_test;

public class Test3 {

	public static void main(String[] args) throws Exception {
		Thread t1 = new Thread(new Dec3(), "t1");
		Thread t2 = new Thread(new Dec4(), "t2");

		t1.start();
		t2.start();
		// }

		System.out.println("main");
	}

}

class Dec3 implements Runnable {
	public static Object lock = new Object();

	@Override
	public void run() {
		try {

			for (int i = 0; i < 10; i++) {
				System.out.println(Thread.currentThread().getName() + "   " + i);
				Thread.sleep(300);
				synchronized (lock) {
					if (i == 5) {
						lock.wait();
					}
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}

class Dec4 implements Runnable {
	@Override
	public void run() {

		try {
			for (int i = 0; i < 10; i++) {
				System.out.println(Thread.currentThread().getName() + "   " + i);
				Thread.sleep(300);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		synchronized (Dec3.lock) {
			Dec3.lock.notifyAll();
		}

	}
}

```