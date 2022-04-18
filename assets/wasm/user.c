#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
int access_code(int a) {
	// emscripten_run_script("");
	return a + 43;
}
