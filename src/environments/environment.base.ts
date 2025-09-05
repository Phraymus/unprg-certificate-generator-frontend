export const environmentBase = {
  HOST_UNPRG_CERTIFICATE_BACKEND: 'http://localhost:3000/api',
};

export function mergeEnviroments<T>(envBase: T, newEnviroment: Partial<T>): T {
	return {
		...envBase,
		...newEnviroment,
	};
}
