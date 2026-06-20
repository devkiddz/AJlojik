import React from 'react';

export default function StoreCategoriesPill() {
  return (
    <div className="sticky flex p-2 rounded-md gap-2">
      <button className="rounded-full bg-rose-500 px-4 py-2 text-xs text-white">All</button>

      <button className="rounded-full border px-4 py-2 text-xs">Kitchen</button>

      <button className="rounded-full border px-4 py-2 text-xs">Wines</button>

      <button className="rounded-full border px-4 py-2 text-xs">Party Plans</button>
    </div>
  );
}
