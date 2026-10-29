// Feature 017: previsão do tempo — tabela WMO, alcance, cidades por dia, faixa do Início e mescla.
import { describe, expect, it } from 'vitest';
import { assembleContent } from '../../scripts/build-content';
import { indexContent } from '../../src/content/load';
import { cityLocations, dayCities, describe as describeCode, homeStrip, mergeWeather, stale, weatherFor, type WeatherStore } from '../../src/domain/weather';

const content = indexContent(assembleContent());
const day = { code: 2, max: 15, min: 9, rain: 20 };
const store: WeatherStore = { fetchedAt: '2026-10-29T18:05:00.000Z', cities: { 'nova-york': { '2026-11-01': day } } };

describe('previsão do tempo — domínio (feature 017)', () => {
  it('códigos WMO em ícone e descrição em português', () => {
    expect(describeCode(0)).toEqual({ icon: 'sun', label: 'Céu limpo' });
    for (const c of [1, 2]) expect(describeCode(c)).toEqual({ icon: 'cloud-sun', label: 'Parcialmente nublado' });
    expect(describeCode(3)).toEqual({ icon: 'cloud', label: 'Nublado' });
    for (const c of [45, 48]) expect(describeCode(c)).toEqual({ icon: 'fog', label: 'Neblina' });
    for (const c of [51, 55, 57]) expect(describeCode(c)).toEqual({ icon: 'rain', label: 'Garoa' });
    for (const c of [61, 65, 67, 80, 82]) expect(describeCode(c)).toEqual({ icon: 'rain', label: 'Chuva' });
    for (const c of [71, 77, 85, 86]) expect(describeCode(c)).toEqual({ icon: 'snow', label: 'Neve' });
    for (const c of [95, 99]) expect(describeCode(c)).toEqual({ icon: 'storm', label: 'Tempestade' });
    expect(describeCode(42)).toEqual({ icon: 'cloud', label: 'Tempo variável' });
  });

  it('previsão salva, "a partir de" além de 7 dias (Q2 = A) e nada salvo', () => {
    expect(weatherFor(store, 'nova-york', '2026-11-01', '2026-10-29')).toEqual({ kind: 'forecast', day, fetchedAt: store.fetchedAt });
    expect(weatherFor(store, 'miami', '2026-11-18', '2026-10-29')).toEqual({ kind: 'later', from: '2026-11-12' });
    expect(weatherFor(store, 'nova-york', '2026-11-04', '2026-10-29')).toEqual({ kind: 'none' });
    expect(weatherFor(null, 'nova-york', '2026-10-30', '2026-10-29')).toEqual({ kind: 'none' });
    expect(weatherFor(null, 'nova-york', '2026-11-05', '2026-10-29')).toEqual({ kind: 'later', from: '2026-10-30' });
  });

  it('cidades do dia: uma; duas nos dias de troca (a que sai e a que chega)', () => {
    expect(dayCities(content, '2026-11-01')).toEqual(['nova-york']);
    expect(dayCities(content, '2026-11-07')).toEqual(['nova-york', 'orlando']);
    expect(dayCities(content, '2026-11-18')).toEqual(['orlando', 'miami']);
    expect(dayCities(content, '2026-11-21')).toEqual(['miami']);
    expect(dayCities(content, '2026-10-30')).toEqual([]);
  });

  it('faixa do Início: hoje + 4; fora da viagem sem cidade', () => {
    expect(homeStrip(content, '2026-10-29')).toEqual([
      { date: '2026-10-29', cities: [] },
      { date: '2026-10-30', cities: [] },
      { date: '2026-10-31', cities: ['nova-york'] },
      { date: '2026-11-01', cities: ['nova-york'] },
      { date: '2026-11-02', cities: ['nova-york'] },
    ]);
    const end = homeStrip(content, '2026-11-19');
    expect(end.map((d) => d.date)).toEqual(['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23']);
    expect(end.slice(3).every((d) => d.cities.length === 0)).toBe(true);
  });

  it('mescla: os dias novos substituem, os outros ficam; a hora da busca é a nova', () => {
    const fresh = { fetchedAt: '2026-10-30T12:00:00.000Z', cities: { 'nova-york': { '2026-11-01': { ...day, max: 16 }, '2026-11-02': day } } };
    const merged = mergeWeather(store, fresh);
    expect(merged.fetchedAt).toBe(fresh.fetchedAt);
    expect(merged.cities['nova-york']).toEqual({ '2026-11-01': { ...day, max: 16 }, '2026-11-02': day });
    const old = { fetchedAt: 'x', cities: { 'nova-york': { '2026-10-28': day } } };
    expect(Object.keys(mergeWeather(old, fresh).cities['nova-york']!)).toEqual(['2026-10-28', '2026-11-01', '2026-11-02']);
    expect(mergeWeather(null, fresh)).toEqual(fresh);
  });

  it('antiga: mais de 24 h', () => {
    expect(stale('2026-10-29T00:00:00.000Z', new Date('2026-10-29T23:00:00.000Z'))).toBe(false);
    expect(stale('2026-10-29T00:00:00.000Z', new Date('2026-10-30T01:00:00.000Z'))).toBe(true);
  });

  it('local de cada cidade: o centro do conteúdo, na ordem da viagem', () => {
    const locs = cityLocations(content);
    expect(locs.map((l) => l.cityId)).toEqual(['nova-york', 'orlando', 'miami']);
    expect(locs[0]).toMatchObject({ lat: 40.7549, lng: -73.984 });
    for (const l of locs) expect(l).toMatchObject(content.cities.find((c) => c.id === l.cityId)!.center);
  });
});
