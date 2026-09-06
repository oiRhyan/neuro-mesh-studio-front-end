import Cookies from "js-cookie";

import { getToken, getUserId, logout } from "../authHelper";

jest.mock("js-cookie", () => ({
  get: jest.fn(),
  remove: jest.fn(),
}));

describe("Auth Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getToken", () => {
    it("deve retornar o token armazenado no cookie", () => {
      (Cookies.get as jest.Mock).mockReturnValue("fake-token-123");

      const result = getToken();

      expect(Cookies.get).toHaveBeenCalledWith("access_token");
      expect(result).toBe("fake-token-123");
    });

    it("deve retornar undefined quando o token não existir", () => {
      (Cookies.get as jest.Mock).mockReturnValue(undefined);

      const result = getToken();

      expect(Cookies.get).toHaveBeenCalledWith("access_token");
      expect(result).toBeUndefined();
    });
  });

  describe("getUserId", () => {
    it("deve retornar o ID do usuário armazenado no cookie", () => {
      (Cookies.get as jest.Mock).mockReturnValue("user-123");

      const result = getUserId();

      expect(Cookies.get).toHaveBeenCalledWith("user_id");
      expect(result).toBe("user-123");
    });

    it("deve retornar undefined quando o ID do usuário não existir", () => {
      (Cookies.get as jest.Mock).mockReturnValue(undefined);

      const result = getUserId();

      expect(Cookies.get).toHaveBeenCalledWith("user_id");
      expect(result).toBeUndefined();
    });
  });

  describe("logout", () => {
    it("deve remover o token e o ID do usuário", () => {
      logout();

      expect(Cookies.remove).toHaveBeenCalledWith("access_token");
      expect(Cookies.remove).toHaveBeenCalledWith("user_id");
    });

    it("deve chamar Cookies.remove exatamente duas vezes", () => {
      logout();

      expect(Cookies.remove).toHaveBeenCalledTimes(2);
    });
  });
});