import { storyblokEditable } from "@storyblok/react/rsc";
import type { ComparisonTableBlok } from "@/components/types";

export default function ComparisonTable({ blok }: { blok: ComparisonTableBlok }) {
  return (
    <section className="comparison-table" {...storyblokEditable(blok)}>
      <div className="wrap">
        <h2>{blok.headline}</h2>
        {blok.intro ? <p className="section-intro">{blok.intro}</p> : null}
        <div className="table-scroll" role="region" aria-label={blok.caption || blok.headline} tabIndex={0}>
          <table>
            <caption>{blok.caption || blok.headline}</caption>
            <thead><tr>{blok.table?.thead.map((cell) => <th scope="col" key={cell._uid}>{cell.value}</th>)}</tr></thead>
            <tbody>{blok.table?.tbody.map((row) => (
              <tr key={row._uid}>{row.body.map((cell, index) => index === 0
                ? <th scope="row" key={cell._uid}>{cell.value}</th>
                : <td key={cell._uid}>{cell.value}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
