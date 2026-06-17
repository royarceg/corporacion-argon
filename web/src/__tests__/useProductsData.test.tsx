import { renderHook, waitFor } from "@testing-library/react";
import { useProductsData } from "../hooks/useProductsData";
import { productService } from "../services/productService";

jest.mock("../services/productService", () => ({
  productService: { getProducts: jest.fn(), getAllAdmin: jest.fn() },
}));

describe("useProductsData", () => {
  beforeEach(() => jest.clearAllMocks());

  test("usuario NO autenticado: fetching termina en false (no se queda cargando)", async () => {
    const { result } = renderHook(() => useProductsData(false, () => false, () => false));
    await waitFor(() => expect(result.current.fetching).toBe(false));
    expect(productService.getProducts).not.toHaveBeenCalled();
    expect(productService.getAllAdmin).not.toHaveBeenCalled();
  });

  test("mientras la auth resuelve (loading=true): sigue fetching=true", () => {
    const { result } = renderHook(() => useProductsData(true, () => false, () => false));
    expect(result.current.fetching).toBe(true);
  });

  test("cliente autenticado: carga productos y fetching pasa a false", async () => {
    (productService.getProducts as jest.Mock).mockResolvedValue([{ id: 1 }]);
    const { result } = renderHook(() => useProductsData(false, () => true, () => false));
    await waitFor(() => expect(result.current.fetching).toBe(false));
    expect(productService.getProducts).toHaveBeenCalled();
    expect(result.current.products).toHaveLength(1);
  });

  test("admin autenticado: usa getAllAdmin", async () => {
    (productService.getAllAdmin as jest.Mock).mockResolvedValue([{ id: 9 }]);
    const { result } = renderHook(() => useProductsData(false, () => true, () => true));
    await waitFor(() => expect(result.current.fetching).toBe(false));
    expect(productService.getAllAdmin).toHaveBeenCalled();
  });
});
