export type FetchLike = typeof fetch;

export type ServiceRequest<TRequest> =
  | RequestInfo
  | URL
  | ((params: TRequest) => string | URL);

export type ServiceRequestInit<TRequest> =
  | RequestInit
  | ((params: TRequest) => RequestInit | undefined);

export type ServiceResponseTransform<TResponse> = (
  response: Response,
) => Promise<TResponse>;

export type ServiceSpec<TRequest, TResponse> = {
  url: ServiceRequest<TRequest>;
  init?: ServiceRequestInit<TRequest>;
  transform?: ServiceResponseTransform<TResponse>;
};

export type CallableService<TRequest, TResponse> = (
  params: TRequest,
) => Promise<TResponse>;
