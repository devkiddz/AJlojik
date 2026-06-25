import React from 'react';
import { Button } from '../ui/button';

export default function StoreCategoriesPill() {
  return (
    <div className="sticky md:h-auto flex md:p-2 rounded-md gap-2">
      <Button
        variant="default"
        className="hover:bg-secondary cursor-pointer rounded-full bg-secondary px-4 text-xs text-white">
        All
      </Button>

      <Button
        variant="default"
        className="bg-muted text-primary ring ring0-muted hover:ring-0 hover:bg-secondary cursor-pointer rounded-full text-xs">
        Kitchen
      </Button>

      <Button
        variant="default"
        className="bg-muted text-primary ring ring0-muted hover:ring-0 hover:bg-secondary cursor-pointer rounded-full text-xs">
        Wines
      </Button>

      <Button
        variant="default"
        className="bg-muted text-primary ring ring0-muted hover:ring-0 hover:bg-secondary cursor-pointer rounded-full text-xs">
        Party Plans
      </Button>
    </div>
  );
}
