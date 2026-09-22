'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import type { CaseBlock } from './caseStudyConfig';

/**
 * Case-study body copy: blocks spaced apart, each a run of paragraphs and
 * bulleted lists that sit tight together, as the Figma text frames have them.
 * Type size and colour come from the parent.
 */

const Blocks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
  width: 100%;
`;

const Block = styled.div`
  p,
  ul {
    margin: 0;
  }

  ul {
    padding-left: 1.5em;
    list-style: disc;
  }
`;

export function CaseBlocks({ blocks, className }: { blocks: CaseBlock[]; className?: string }) {
  return (
    <Blocks className={className}>
      {blocks.map((block, b) => (
        <Block key={b}>
          {block.map((line, l) =>
            typeof line === 'string' ? (
              <p key={l}>{line}</p>
            ) : (
              <ul key={l}>
                {line.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ),
          )}
        </Block>
      ))}
    </Blocks>
  );
}
