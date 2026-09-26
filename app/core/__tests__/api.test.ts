import { tripoApi } from '../api';

describe('tripoApi', () => {
  it('deve instanciar o axios com a configuração correta para uso de cookies do servidor', () => {
    expect(tripoApi.defaults.baseURL).toBe('https://neuromeshstudio-g2gba3chgehkgncv.brazilsouth-01.azurewebsites.net/api');
    expect(tripoApi.defaults.timeout).toBe(50000);
    expect(tripoApi.defaults.withCredentials).toBe(true);
  });
});