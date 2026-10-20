import type { Category, City, CityId } from '../content/types';

export function CityPicker({
  cities,
  value,
  todayCity,
  onChange,
}: {
  cities: City[];
  value: CityId;
  todayCity: CityId;
  onChange: (id: CityId) => void;
}) {
  return (
    <div class="chips" role="group" aria-label="Cidade">
      {cities.map((c) => (
        <button key={c.id} type="button" class="chip" aria-pressed={c.id === value} onClick={() => onChange(c.id)}>
          {c.name}
          {c.id === todayCity && <span class="muted small"> · hoje</span>}
        </button>
      ))}
    </div>
  );
}

export function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <div class="chips" role="group" aria-label="Categoria">
      <button type="button" class="chip" aria-pressed={value === null} onClick={() => onChange(null)}>
        Todas
      </button>
      {categories.map((c) => (
        <button key={c.id} type="button" class="chip" aria-pressed={c.id === value} onClick={() => onChange(c.id)}>
          {c.name}
        </button>
      ))}
    </div>
  );
}
