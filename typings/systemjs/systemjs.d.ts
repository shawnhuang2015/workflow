// Type definitions for System.js 0.18.4
// Project: https://github.com/systemjs/systemjs
// Definitions by: Ludovic HENIN <https://github.com/ludohenin/>, Nathan Walker <https://github.com/NathanWalker/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface ISystem {
	constructor: any;
	import(name: string): any;
	load(name: string): any;
	defined: any;
	amdDefine: () => void;
	amdRequire: () => void;
	baseURL: string;
	paths: { [key: string]: string };
	meta: { [key: string]: Object };
	config: any;
	_nodeRequire: (name: string) => any;
}

declare var SystemJS: ISystem;

declare module "systemjs" {
	export = SystemJS;
}
