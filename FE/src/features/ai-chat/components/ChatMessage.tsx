import type { ChatMessage as Message } from '../../../shared/types/models';
import { ProductCard } from '../../products/ProductCard';
import { ComparisonTable } from '../../comparison/ComparisonTable';
import { Icon } from '../../../shared/components/Icon';
import { isDemo } from '../../../shared/api';
export function ChatMessage({ message }: { message: Message }) {
  return (
    <article
      className={`message ${message.role}`}
      aria-label={
        message.role === 'user' ? 'Bạn' : message.role === 'assistant' ? 'Trợ lý AI' : 'Thông báo'
      }
    >
      {message.role === 'assistant' && (
        <span className="icon-tile !w-9 !h-9">
          <Icon name="auto_awesome" />
        </span>
      )}
      <div className="message-bubble">
        {message.role === 'assistant' && (
          <p className="text-xs font-semibold text-secondary mb-3">Trợ lý SmartPhone AI</p>
        )}
        {/* React escapes plain text, including model-supplied markup and URLs. */}
        <p>{message.content}</p>
        {!!message.recommendedProducts?.length && (
          <div className="product-grid">
            {message.recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {!!message.comparedProducts?.length && (
          <div className="mt-5 whitespace-normal">
            <ComparisonTable products={message.comparedProducts} />
          </div>
        )}
        {message.sources?.map((s, i) => (
          <span key={`${s.documentId}-${i}`} className="source-card" title={s.excerpt}>
            <Icon name="description" className="!text-base" />
            <span>
              {s.documentName}
              {s.pageNumber ? ` · Trang ${s.pageNumber}` : ''}
              {s.section ? ` · ${s.section}` : ''}
            </span>
            {isDemo && s.documentId === 'demo-policy' && (
              <a
                href="/demo/Chinh-sach-minh-hoa.txt"
                target="_blank"
                rel="noreferrer"
                aria-label="Mở tài liệu minh họa"
              >
                <Icon name="open_in_new" className="!text-sm" />
              </a>
            )}
          </span>
        ))}
      </div>
    </article>
  );
}
