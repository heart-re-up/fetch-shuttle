export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 여러 필드를 옵셔널로 만드는 타입
export type OptionalMultiple<T, K extends readonly (keyof T)[]> = Omit<
  T,
  K[number]
> &
  Partial<Pick<T, K[number]>>;

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
