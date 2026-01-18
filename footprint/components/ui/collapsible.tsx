'use client';

import * as React from 'react';

interface CollapsibleContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function Collapsible({ open = false, onOpenChange, children, className = '' }: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <CollapsibleContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      <div className={className}>{children}</div>
    </CollapsibleContext.Provider>
  );
}

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

function CollapsibleTrigger({ children, className = '', asChild = false }: CollapsibleTriggerProps) {
  const context = React.useContext(CollapsibleContext);
  if (!context) throw new Error('CollapsibleTrigger must be used within Collapsible');

  const handleClick = () => context.onOpenChange(!context.open);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return (
    <button
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
}

function CollapsibleContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const context = React.useContext(CollapsibleContext);
  if (!context) throw new Error('CollapsibleContent must be used within Collapsible');

  if (!context.open) return null;

  return <div className={className}>{children}</div>;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
