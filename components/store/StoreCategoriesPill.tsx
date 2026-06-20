import React from 'react';

export default function StoreCategoriesPill() {
  return (
    <div className="flex sticky">
      <button className="rounded-full bg-rose-500 px-4 py-2 text-xs text-white">All</button>

      <button className="rounded-full border px-4 py-2 text-xs">Kitchen</button>

      <button className="rounded-full border px-4 py-2 text-xs">Wines</button>

      <button className="rounded-full border px-4 py-2 text-xs">Party Plans</button>
    </div>
  );
}
