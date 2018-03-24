declare module 'pkginfo' {
  namespace pkginfo {
    export interface Info {
      version: string;
    }
  }

  function pkginfo(module?: NodeModule): pkginfo.Info;
  function pkginfo(module: NodeModule, ...args: string[]): pkginfo.Info;

  export = pkginfo;
}
