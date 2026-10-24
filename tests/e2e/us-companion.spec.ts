// Feature 006: guia de bolso (specs/006-trip-companion-ux/quickstart.md). O momento é simulado com
// ?agora= (hora local de Nova York); o relógio do navegador fica antes da viagem.
import { expect, test, type Page } from '@playwright/test';
import { goOffline, openInstalled } from './helpers';

async function at(page: Page, agora: string, hash: string) {
  await page.goto(`/?agora=${agora}#${hash}`);
  await expect(page.locator('main, .driver').first()).toBeVisible();
}

test.describe('US1 – Agora', () => {
  test('abre no próximo passo de hoje, sem tocar em nada, também offline', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-01T13:30', '/');
    const card = page.getByRole('article', { name: 'Próximo passo: Mott Street' });
    await expect(card.locator('.next-time')).toHaveText('13h40');
    await expect(card).toContainText('Chinatown');
    await expect(card).toContainText('Deslocamento para Chinatown');
    await expect(card.locator('img')).toBeVisible();
  });

  test('Feito avança; Desfazer volta', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-01T13:30', '/');
    await page.getByRole('button', { name: /Feito/ }).click();
    await expect(page.getByRole('article', { name: 'Próximo passo: Doyers Street' })).toBeVisible();
    await page.getByRole('button', { name: 'Desfazer' }).click();
    await expect(page.getByRole('article', { name: 'Próximo passo: Mott Street' })).toBeVisible();
  });

  test('Mostrar ao motorista: tela cheia com endereço grande', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-10-31T15:05', '/');
    await page.getByRole('link', { name: /Motorista/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Mostrar ao motorista' });
    await expect(dialog).toContainText('Top of the Rock');
    const size = await dialog.locator('.driver-address').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    expect(size).toBeGreaterThanOrEqual(40);
    await expect(page.locator('.tab-bar')).toHaveCount(0);
  });

  test('aviso do dia: "Entendi" esconde e não volta no mesmo dia', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-01T13:30', '/');
    const banner = page.getByRole('complementary', { name: 'Aviso do dia' });
    await expect(banner).toContainText('Maratona');
    await banner.getByRole('button', { name: 'Entendi' }).click();
    await expect(banner).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('complementary', { name: 'Aviso do dia' })).toHaveCount(0);
  });

  test('antes da viagem: contagem e ingressos; dia concluído mostra amanhã', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z', '/');
    await expect(page.getByRole('heading', { name: 'Falta 1 dia' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Ingressos para comprar antes' })).toContainText('Tenement Museum, tour das 16h15');
  });
});

test.describe('US2 – Dia', () => {
  test('≥ 8 passos na primeira tela de 390 × 844, sem opções misturadas', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-01T13:30', '/dia/2026-11-01');
    await page.waitForTimeout(5500); // o aviso "Guia disponível offline" some sozinho
    const inFold = await page.evaluate(() => [...document.querySelectorAll('.tl-step')].filter((e) => e.getBoundingClientRect().bottom <= innerHeight - 64).length);
    expect(inFold).toBeGreaterThanOrEqual(8);
    await expect(page.locator('.tl-list .place-short, .tl-list .place-card')).toHaveCount(0);
    await expect(page.locator('.tl-now')).toHaveText('agora · 13h30');
  });

  test('deslizar troca de dia; "Voltar para hoje"', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-01T13:30', '/dia/2026-11-01');
    const box = (await page.locator('main.day').boundingBox())!;
    await page.mouse.move(box.x + box.width - 30, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 30, box.y + 310, { steps: 8 });
    await page.mouse.up();
    await expect(page).toHaveURL(/#\/dia\/2026-11-02$/);
    await page.getByRole('link', { name: 'Voltar para hoje' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'domingo, 01/11' })).toBeVisible();
  });
});

test.describe('US3 – Por perto', () => {
  test('região atual com 6 opções de comida; filtro 🍰; detalhe com mapa e motorista', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-01T13:40', '/perto');
    await expect(page.getByRole('navigation', { name: 'Regiões do dia' }).getByRole('link', { name: 'Chinatown' })).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('link', { name: 'Comer (6)' })).toBeVisible();
    await page.getByRole('link', { name: '🍰 Doces' }).click();
    await expect(page.locator('.place-short')).toHaveCount(2);
    await page.locator('.place-short').first().click();
    await expect(page.getByRole('link', { name: 'Abrir no mapa' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Mostrar ao motorista/ })).toBeVisible();
  });
});

test.describe('US4 – detalhe', () => {
  test('Grand Central: foto, horário e ações na primeira tela; "Ler mais" recolhido', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-10-31T09:00', '/dia/2026-10-31/ny3-2026-10-31-04');
    await expect(page.locator('.step-photo img')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Grand Central Terminal' })).toBeInViewport();
    await expect(page.getByRole('button', { name: /Pular/ })).toBeInViewport();
    await expect(page.locator('details.read-more')).not.toHaveAttribute('open', '');
  });
});

test.describe('US5 – Viagem e transição', () => {
  test('Viagem em 03/11: NY marcada, dia 4 de 8, guia acessível', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-03T10:00', '/viagem');
    await expect(page.getByText(/Vocês estão aqui · dia 4 de 8/)).toBeVisible();
    await page.getByRole('link', { name: /Guia de pontos turísticos/ }).click();
    await expect(page).toHaveURL(/#\/guia$/);
  });

  test('07/11: três blocos, marcar e desfazer, offline', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await goOffline(context, page);
    await at(page, '2026-11-07T09:00', '/');
    await expect(page.getByRole('heading', { name: '1. Antes de sair' })).toBeVisible();
    const first = page.getByRole('region', { name: 'Antes de sair' }).getByRole('checkbox').first();
    await first.click();
    await expect(first).toHaveAttribute('aria-checked', 'true');
    await first.click();
    await expect(first).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('region', { name: 'A viagem' })).toContainText('LaGuardia');
  });
});

test.describe('rotas antigas', () => {
  test('#/destino/... vai para #/dia/...', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z', '/destino/nova-york/2026-11-02');
    await expect(page).toHaveURL(/#\/dia\/2026-11-02$/);
    await page.goto('/#/full/nova-york/2026-11-03');
    await expect(page).toHaveURL(/#\/dia\/2026-11-03$/);
  });
});

test.describe('regressão das features anteriores', () => {
  // Feature 007: Orlando agora tem horários (doc do casal); Miami continua como lista de sugeridos.
  test('Miami: dia sem horários vira lista, marca e progresso; guia da cidade a um toque', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-11-19T10:00', '/dia/2026-11-19');
    const first = page.locator('.tl-step').first();
    await expect(first).toContainText('South Beach');
    await expect(page.locator('.tl-now')).toHaveCount(0);
    await first.getByRole('checkbox').click();
    await expect(first.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    await page.reload();
    await expect(page.locator('.tl-step').first().getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('link', { name: /Ver o guia de Miami/ })).toBeVisible();
  });

  test('marcas dos roteiros anteriores (ny-, nyv2-) não marcam o roteiro novo', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('ctha:user:v1')!);
      for (let i = 1; i <= 20; i++) {
        const n = String(i).padStart(2, '0');
        s.activityMarks[`ny-2026-11-02-${n}`] = { state: 'done', at: '2026-11-02T14:00:00Z' };
        s.activityMarks[`nyv2-2026-11-02-${n}`] = { state: 'done', at: '2026-11-02T14:00:00Z' };
      }
      s.activityMarks['ny3-2026-11-02-03'] = { state: 'done', at: '2026-11-02T14:00:00Z' };
      localStorage.setItem('ctha:user:v1', JSON.stringify(s));
    });
    await at(page, '2026-11-02T09:00', '/dia/2026-11-02');
    await page.reload();
    await expect(page.locator('.tl-step.is-done')).toHaveCount(1);
  });

  test('documento completo offline, com todas as seções', async ({ page, context }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z', '/full/nova-york/documento');
    await goOffline(context, page);
    await expect(page.locator('section.doc-html > h2')).toHaveCount(10);
    await expect(page.getByRole('heading', { name: '📚 Fontes consultadas' })).toBeVisible();
  });

  test('detalhe com foto do guia e crédito; links "Ver fotos" e mapa do doc', async ({ page }) => {
    await openInstalled(page, '2026-10-30T15:00:00Z');
    await at(page, '2026-10-31T09:00', '/dia/2026-10-31/ny3-2026-10-31-04');
    await expect(page.locator('.step-photo figcaption')).toContainText('Foto:');
    await expect(page.getByRole('link', { name: 'Abrir no mapa' })).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=Grand+Central+Terminal+New+York');
    await expect(page.getByRole('link', { name: 'Ver fotos' })).toHaveAttribute('href', 'https://www.google.com/search?tbm=isch&q=Grand+Central+Terminal+main+concourse');
  });
});
