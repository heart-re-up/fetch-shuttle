import {
  AsyncServiceRequest,
  AsyncServiceRequestInit,
  CallableService,
  FetchLike,
  ServiceRequest,
  ServiceRequestInit,
  ServiceSpec,
} from "./types";

const resolveUrl = async <TRequest>(
  request: TRequest,
  serviceRequest: ServiceRequest<TRequest> | AsyncServiceRequest<TRequest>,
): Promise<URL | RequestInfo> => {
  if (typeof serviceRequest === "function") {
    const result = serviceRequest(request);
    return result instanceof Promise ? await result : result;
  }

  return serviceRequest instanceof Promise
    ? await serviceRequest
    : serviceRequest;
};

const resolveInit = async <TRequest>(
  request: TRequest,
  serviceRequestInit?:
    | ServiceRequestInit<TRequest>
    | AsyncServiceRequestInit<TRequest>,
): Promise<RequestInit | undefined> => {
  if (typeof serviceRequestInit === "function") {
    const result = serviceRequestInit(request);
    return result instanceof Promise ? await result : result;
  }

  return serviceRequestInit instanceof Promise
    ? await serviceRequestInit
    : serviceRequestInit;
};

// HTTP 클라이언트는 TRequest 만 받고 TResponse 만 내보내도록 하자.
export class Service {
  private readonly _fetch: FetchLike;
  constructor(fetch?: FetchLike) {
    this._fetch = fetch ?? globalThis.fetch;
  }

  create<TRequest, TResponse = unknown>(
    spec: ServiceSpec<TRequest, TResponse>,
  ): CallableService<TRequest, TResponse> {
    const serviceFunction = async (params: TRequest): Promise<TResponse> => {
      const url = await resolveUrl(params, spec.url);
      const init = (await resolveInit(params, spec.init)) ?? { method: "GET" };
      const response = await this._fetch(url, init);
      if (spec.transform === undefined) {
        return (await response.json()) as TResponse;
      }
      return await spec.transform(response);
    };

    // TRequest가 void인 경우와 아닌 경우를 구분하여 함수 반환
    if (false as unknown as TRequest extends void ? true : false) {
      // void 타입인 경우
      const noParamFunction = () => serviceFunction({} as TRequest);
      const optionalParamFunction = (params?: TRequest) =>
        serviceFunction(params ?? ({} as TRequest));

      // 두 함수를 합쳐서 반환
      return Object.assign(
        noParamFunction,
        optionalParamFunction,
      ) as CallableService<TRequest, TResponse>;
    } else {
      // void가 아닌 경우
      return serviceFunction as CallableService<TRequest, TResponse>;
    }
  }
}
