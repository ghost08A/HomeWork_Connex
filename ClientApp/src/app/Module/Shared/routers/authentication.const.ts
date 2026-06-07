export class AuthenticationRoute {

    static prefix = 'auth';

    static login = `login`;
    static loginFullPath = `${AuthenticationRoute.prefix}/${AuthenticationRoute.login}`;
    static loginPageCode = 'AUTH_LOGIN';

    static register = `register`;
    static registerFullPath = `${AuthenticationRoute.prefix}/${AuthenticationRoute.register}`;
    static registerPageCode = 'AUTH_REGISTER';

}