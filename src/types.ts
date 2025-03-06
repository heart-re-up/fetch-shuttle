export type FetchLike = typeof fetch;

export type PropertyInitializer<TParamsType, TReturnType> =
  | TReturnType
  | Promise<TReturnType>
  | ((params: TParamsType) => TReturnType)
  | ((params: TParamsType) => Promise<TReturnType>);

export type ResponseTransform<TResponse = unknown> = (
  response: Response,
) => Promise<TResponse>;

export type ServiceSpec<TRequest, TResponse> = {
  url: PropertyInitializer<TRequest, RequestInfo | URL>;
  init?: PropertyInitializer<TRequest, RequestInit | undefined>;
  transform?: ResponseTransform<TResponse>;
};

export type CallableService<TRequest, TResponse> = TRequest extends void
  ? (() => Promise<TResponse>) & ((params?: TRequest) => Promise<TResponse>)
  : (params: TRequest) => Promise<TResponse>;
