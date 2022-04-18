#include <emscripten.h>
#include <stdio.h>

int access_code(int a);

int main() {
	printf("[+] checking access code to unlock launch codes...\n");
	printf("%d\n", access_code(1));
}
