#include <stdio.h>

const char *notice = "x| access to function %s() is denied.\n";

// prints our security warning
void printn(const char* cmd) {
	char msg[100];
	snprintf(msg, sizeof(msg), notice, cmd);
	printf("%s\n", msg);
}

// function replacements

int system(const char *command) {
	printn("system");
	return 0;
}

int execve(const char *pathname, char *const argv[], char *const envp[]) {
	printn("execve");
	return 0;
}

int execl(const char *pathname, const char *arg, ...  /* (char  *) NULL */) {
	printn("execl");
	return 0;
}

int execlp(const char *file, const char *arg, ...  /* (char  *) NULL */) {
	printn("execlp");
	return 0;
}

int execle(const char *pathname, const char *arg, ...  /*, (char *) NULL, char *const envp[] */) {
	printn("execle");
	return 0;
}

int execv(const char *pathname, char *const argv[]) {
	printn("execv");
	return 0;
}

int execvp(const char *file, char *const argv[]) {
	printn("execvp");
	return 0;
}

int execvpe(const char *file, char *const argv[], char *const envp[]) {
	printn("execvpe");
	return 0;
}

int fexecve(int fd, char *const argv[], char *const envp[]) {
	printn("fexecve");
	return 0;
}
