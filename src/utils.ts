export const extractMimeType = (headers: Headers) => {
  const contentType = headers.get("content-type");
  return contentType?.split(";")[0].trim().toLowerCase();
};

export const defaultTransform = async <TResponse>(
  response: Response,
): Promise<string | object | Blob> => {
  // MIME 타입만 추출 (매개변수 제외)
  const mimeType = extractMimeType(response.headers);
  if (!mimeType) {
    throw new Error(
      "Cannot determine the mime type of the response. Please implement a custom transform function.",
    );
  }

  if (mimeType === "application/json") {
    return await response.json();
  }

  if (
    ["image/", "audio/", "video/"].some((type) => mimeType.startsWith(type))
  ) {
    return await response.blob();
  }

  // 기본적으로 텍스트 반환
  return await response.text();
};
