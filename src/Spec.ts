import { parseURL } from "./url.parser";

type SpecDetail<
  TemplateURL extends string = string,
  PathVariables = unknown,
  QueryVariables = unknown,
  INIT = string extends TemplateURL ? RequestInit : never,
> = Omit<
  URLComponents<TemplateURL>,
  | ([PathVariables] extends [never] ? "pathVariables" : never)
  | ([QueryVariables] extends [never] ? "queryVariables" : never)
  | ([INIT] extends [never] ? "init" : never)
> & {
  templateUrl: TemplateURL;
  init?: INIT;
  timestamp: string;
};

// types
// URL : 원격 서버 호출을 위한 호출 정보. eg) "/api/users/${userId}"
// REQUEST : 원격 서버 호출을 위한 데이터 정보. request body 가 된다. eg) { userId: string }
// RESPONSE : 원격 서버 호출을 위한 호출 정보. eg) { userId: string }

class Spec<
  TemplateURL extends string = string,
  PathVariables = TemplateURL extends string
    ? URLComponents<TemplateURL>["pathVariables"]
    : never,
  QueryVariables = TemplateURL extends string
    ? URLComponents<TemplateURL>["queryParams"]
    : never,
  INIT = string extends TemplateURL ? RequestInit : never,
> {
  private templateUrl: TemplateURL;

  _types?: {
    detail: SpecDetail<TemplateURL, PathVariables, QueryVariables, INIT>;
  };

  constructor({
    templateUrl,
    init,
  }: {
    templateUrl: TemplateURL;
    init?: RequestInit;
  }) {}

  parseSpecDetail(
    templateUrl: TemplateURL,
  ): SpecDetail<TemplateURL, PathVariables, QueryVariables, INIT> {
    const urlComponents = parseURL(templateUrl);
    return {
      templateUrl,
      timestamp: new Date().toISOString(),
      ...urlComponents,
    } as SpecDetail<TemplateURL, PathVariables, QueryVariables, INIT>;
  }
}

const spec = new Spec({
  templateUrl: "/api/users/:userId?sort=:sort&q=normal",
  init: {
    method: "GET",
  },
});
