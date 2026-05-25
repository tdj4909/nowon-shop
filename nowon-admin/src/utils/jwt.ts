/**
 * JWT 토큰 관련 유틸리티
 *
 * JWT는 header.payload.signature 형태로 base64 인코딩되어 있다.
 * 클라이언트에서는 payload 부분만 디코딩해서 사용자 정보를 추출한다.
 * (서명 검증은 서버에서 처리하므로 클라이언트는 무결성 검증 책임이 없음)
 */

interface JwtPayload {
  role?: string;
  sub?: string;
  exp?: number;
  [key: string]: unknown;
}

/**
 * JWT payload를 디코딩한다. 형식이 잘못된 경우 null 반환.
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    return JSON.parse(atob(payloadBase64)) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * JWT에서 role 클레임을 추출한다. 추출 실패 시 null.
 */
export function getRoleFromToken(token: string): string | null {
  return decodeJwtPayload(token)?.role ?? null;
}
