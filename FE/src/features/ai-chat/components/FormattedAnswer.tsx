import { Fragment, useMemo } from 'react';
import { parseAnswer, type InlinePart } from '../utils/answerFormat';

function Inline({ parts }: { parts: InlinePart[] }) {
  return (
    <>
      {parts.map((part, i) =>
        part.strong ? (
          <strong key={i}>{part.text}</strong>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}

/** Renders AI text as short paragraphs and lists. Text is never injected as HTML. */
export function FormattedAnswer({ content }: { content: string }) {
  const blocks = useMemo(() => parseAnswer(content), [content]);
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph')
          return (
            <p key={index}>
              <Inline parts={block.parts} />
            </p>
          );
        const groups: { parts: InlinePart[]; children: InlinePart[][] }[] = [];
        for (const item of block.items) {
          const parent = groups[groups.length - 1];
          if (item.depth > 0 && parent) parent.children.push(item.parts);
          else groups.push({ parts: item.parts, children: [] });
        }
        const List = block.ordered ? 'ol' : 'ul';
        return (
          <List key={index}>
            {groups.map((group, i) => (
              <li key={i}>
                <Inline parts={group.parts} />
                {!!group.children.length && (
                  <ul>
                    {group.children.map((child, j) => (
                      <li key={j}>
                        <Inline parts={child} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </List>
        );
      })}
    </>
  );
}
