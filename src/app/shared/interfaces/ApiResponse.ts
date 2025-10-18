// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
	error: boolean;
	codigo: number;
	mensaje: string;
	data: T;
	titulo: string;
	type?: string;
}
