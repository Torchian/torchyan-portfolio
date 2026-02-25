'use client';

import React from 'react';

interface PortableTextBlock {
  _type: string;
  _key: string;
  style?: string;
  children?: Array<{ _key: string; text: string; marks?: string[] }>;
  markDefs?: Array<{ _key: string; _type: string; href?: string; blank?: boolean }>;
}

interface PortableTextProps {
  value: PortableTextBlock[];
}

export function PortableTextRenderer({ value }: PortableTextProps) {
  if (!value) return null;

  return (
    <div>
      {value.map((block) => {
        if (block._type !== 'block') return null;

        const tag = getBlockTag(block.style);
        const children = block.children?.map((child) => {
          let content: React.ReactNode = child.text;

          if (child.marks?.includes('strong')) {
            content = <strong>{content}</strong>;
          }
          if (child.marks?.includes('em')) {
            content = <em>{content}</em>;
          }
          if (child.marks?.includes('code')) {
            content = <code>{content}</code>;
          }

          const linkMark = child.marks?.find(
            (m) => !['strong', 'em', 'code'].includes(m),
          );
          if (linkMark && block.markDefs) {
            const def = block.markDefs.find((d) => d._key === linkMark);
            if (def?.href) {
              content = (
                <a
                  href={def.href}
                  target={def.blank ? '_blank' : undefined}
                  rel={def.blank ? 'noopener noreferrer' : undefined}
                >
                  {content}
                </a>
              );
            }
          }

          return <React.Fragment key={child._key}>{content}</React.Fragment>;
        });

        return React.createElement(tag, { key: block._key }, children);
      })}
    </div>
  );
}

function getBlockTag(style?: string): 'p' | 'h2' | 'h3' | 'h4' | 'blockquote' {
  switch (style) {
    case 'h2':
      return 'h2';
    case 'h3':
      return 'h3';
    case 'h4':
      return 'h4';
    case 'blockquote':
      return 'blockquote';
    default:
      return 'p';
  }
}
