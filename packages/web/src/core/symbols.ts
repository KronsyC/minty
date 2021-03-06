export const kBaseServer = Symbol('Base Server');
export const kServerState = Symbol('Server lifecycle stage');
export const kHandlerStore = Symbol('Route Store');
export const kInitializers = Symbol('Initializer Function');
export const kPrefix = Symbol('Context Route Prefix');
export const kRouter = Symbol('Router');
export const kOnPluginLoadHandlers = Symbol('On Plugin Load Handlers');
export const kOnRouteRegisterHandlers = Symbol('On Route Register Handlers');
export const kInterceptors = Symbol('Interceptors');
export const kErrorHandler = Symbol('Error Handler');
export const kNotFoundHandler = Symbol('Not Found Handler');
export const kQuery = Symbol("Query")
export const kParams = Symbol("Params")
export const kBody = Symbol("Body")
export const kCreateSendCallback = Symbol('Create Send Callback Method');
export const kCreateSendFileCallback = Symbol('Create Send File Callback');
export const kOutgoingDataCallback = Symbol("Outgoing Data Callback")
export const kMessageHandler = Symbol("Message Handler (Injected)")