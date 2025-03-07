// 콜론 방식의 단일 파라미터 추출 (:param)
type ExtractPathParam<T extends string> =
  T extends `${infer _Start}:${infer Param}`
    ? Param extends `${infer ParamName}/${infer _Rest}`
      ? ParamName
      : Param
    : never;

// 콜론 방식의 URL에서 첫 번째 파라미터 이후의 나머지 부분 추출
type RestAfterPathParam<T extends string> =
  T extends `${infer _Start}:${infer _Param}/${infer Rest}`
    ? Rest
    : T extends `${infer _Start}:${infer _Param}`
      ? ""
      : never;

// URL에 파라미터가 있는지 확인
type HasPathParams<T extends string> = T extends `${infer _Start}:${string}`
  ? true
  : false;

// URL에서 스키마와 나머지 부분 분리
type SplitSchemeAndRest<T extends string> =
  T extends `${infer Scheme}://${infer Rest}`
    ? { scheme: Scheme; rest: Rest }
    : { scheme: never; rest: T };

// 호스트와 경로 분리
type SplitHostAndPath<T extends string> =
  T extends `${infer Host}/${infer Path}`
    ? { host: Host; path: Path }
    : { host: T; path: never };

// 경로와 쿼리 분리 (수정)
type SplitPathAndQuery<T extends string> =
  T extends `${infer Path}?${infer Query}`
    ? { path: Path; query: Query }
    : { path: T; query: never };

// 최종 URL 파라미터 추출 타입
type ExtractURLParams<T extends string> =
  HasPathParams<T> extends true
    ? { [K in ExtractPathParam<T>]: string } & ExtractURLParams<
        RestAfterPathParam<T>
      >
    : {};

// 쿼리 파라미터 추출 개선 (동적 값과 고정 값 구분)
type ExtractQueryParams<T extends string> =
  T extends `${infer Param}=${infer Value}&${infer Rest}`
    ? Value extends `:${infer _DynamicValue}`
      ? { [K in Param]: string } & ExtractQueryParams<Rest> // dynamic value
      : { [K in Param]: Value } & ExtractQueryParams<Rest> // static value
    : T extends `${infer Param}=${infer Value}`
      ? Value extends `:${infer _DynamicValue}`
        ? { [K in Param]: string } // dynamic value
        : { [K in Param]: Value } // static value
      : {};

// 절대 URL 분석 결과
type PickPathAndQuery<T extends string> = {
  pathPart: SplitPathAndQuery<
    SplitHostAndPath<SplitSchemeAndRest<T>["rest"]>["path"]
  >["path"];
  queryPart: SplitPathAndQuery<
    SplitHostAndPath<SplitSchemeAndRest<T>["rest"]>["path"]
  >["query"];
};

// 교차 타입을 단일 객체 타입으로 변환
type Flatten<T> = { [K in keyof T]: T[K] };

type URLComponents<T extends string> = {
  type: "absolute" | "relative";
  scheme?: string;
  host?: string;
  port?: number;
  pathTemplate: string;
  pathVariables: Flatten<ExtractURLParams<PickPathAndQuery<T>["pathPart"]>>;
  queryTemplate?: string;
  queryParams: Flatten<ExtractQueryParams<PickPathAndQuery<T>["queryPart"]>>;
  hasPathVariables: boolean;
  hasQueryParams: boolean;
};
