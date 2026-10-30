import { Link } from 'react-router-dom';
export function HomeHero() {
  return (
    <section
      className={
        'relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low to-surface pt-12 pb-20'
      }
    >
      <div
        className={
          'absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-secondary-fixed/30 rounded-full blur-[120px] pointer-events-none'
        }
      ></div>
      <div
        className={
          'absolute top-1/3 right-10 w-[350px] h-[350px] bg-primary-fixed/40 rounded-full blur-[100px] pointer-events-none'
        }
      ></div>
      <div className={'max-w-[1240px] mx-auto px-gutter relative z-10'}>
        <div className={'flex flex-col items-center text-center max-w-[880px] mx-auto'}>
          <div
            className={
              'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-sm mb-6'
            }
          >
            <span
              className={
                'inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-on-secondary'
              }
            >
              <span className={'material-symbols-outlined text-[14px]'}>{'auto_awesome'}</span>
            </span>
            <span
              className={
                'font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold'
              }
            >
              {' Thế hệ mua sắm Smartphone mới '}
            </span>
            <span className={'w-1.5 h-1.5 rounded-full bg-secondary'}></span>
            <span className={'font-label-sm text-label-sm text-secondary font-semibold'}>
              {'SmartPhone AI'}
            </span>
          </div>
          <h1
            className={
              'font-display-hero text-display-hero-mobile md:text-display-hero text-on-surface tracking-tight mb-6'
            }
          >
            {' Công nghệ bạn yêu. '}
            <br />
            <span
              className={
                'bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent'
              }
            >
              {'Lựa chọn thông minh hơn.'}
            </span>
          </h1>
          <p
            className={
              'font-body-lg text-body-lg text-on-surface-variant max-w-[700px] mb-10 leading-relaxed'
            }
          >
            {
              ' Khám phá điện thoại và tìm chiếc máy phù hợp với bạn cùng thông tin sản phẩm rõ ràng và trợ lý AI. '
            }
          </p>
          <div className={'flex flex-wrap items-center justify-center gap-space-md mb-16'}>
            <Link
              className={
                'inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm hover:shadow-md transition-all group'
              }
              to="/products"
            >
              {' Khám phá điện thoại '}
              <span
                className={
                  'material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform'
                }
              >
                {'arrow_forward'}
              </span>
            </Link>
            <Link
              className={
                'inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-surface-container-lowest text-secondary font-label-md text-label-md font-semibold shadow-sm hover:shadow-md hover:bg-secondary-fixed/20 transition-all'
              }
              to="/ai"
            >
              <span className={'material-symbols-outlined text-[18px] text-secondary'}>
                {'auto_awesome'}
              </span>
              {' Tư vấn cùng AI ✨ '}
            </Link>
          </div>
        </div>
        <div className={'relative w-full max-w-[1100px] mx-auto mt-2'}>
          <div
            className={
              'relative w-full h-[460px] md:h-[540px] rounded-3xl bg-surface-container-lowest shadow-xl flex items-center justify-center overflow-hidden'
            }
          >
            <div
              className={
                'absolute inset-0 bg-gradient-to-tr from-surface-container-low/60 via-transparent to-secondary-fixed/20'
              }
            ></div>
            <img
              className={
                'w-full h-full object-cover object-center relative z-10 transition-transform duration-700 hover:scale-[1.02]'
              }
              data-alt={
                'Photorealistic flagship studio render showcasing Titanium Natural iPhone 16 Pro Max and Samsung Galaxy S24 Ultra side by side on pristine white minimalist platform, soft diffuse lighting, studio shadows, 8k resolution, elegant modern luxury consumer technology retail display'
              }
              src={'/images/ec1933ac81872449.webp'}
              alt={
                'Photorealistic flagship studio render showcasing Titanium Natural iPhone 16 Pro Max and Samsung Galaxy S24 Ultra side by side on pristine white minimalist platf'
              }
            />
            <div
              className={
                'absolute top-8 left-8 z-20 hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md shadow-md hover:-translate-y-0.5 transition-transform'
              }
            >
              <div
                className={
                  'w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed'
                }
              >
                <span className={'material-symbols-outlined text-[20px]'}>{'smart_toy'}</span>
              </div>
              <div className={'text-left'}>
                <p
                  className={
                    'font-caption text-caption text-on-surface-variant uppercase tracking-wider'
                  }
                >
                  {'Khả năng máy'}
                </p>
                <p className={'font-label-md text-label-md text-on-surface font-semibold'}>
                  {'Khám phá camera'}
                </p>
              </div>
            </div>
            <div
              className={
                'absolute top-1/2 -translate-y-1/2 right-8 z-20 hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md shadow-md hover:-translate-y-0.5 transition-transform'
              }
            >
              <div
                className={
                  'w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed'
                }
              >
                <span className={'material-symbols-outlined text-[20px]'}>{'memory'}</span>
              </div>
              <div className={'text-left'}>
                <p
                  className={
                    'font-caption text-caption text-on-surface-variant uppercase tracking-wider'
                  }
                >
                  {'Hiệu năng chuẩn'}
                </p>
                <p className={'font-label-md text-label-md text-on-surface font-semibold'}>
                  {'So sánh hiệu năng'}
                </p>
              </div>
            </div>
            <div
              className={
                'absolute bottom-8 left-12 z-20 hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md shadow-md hover:-translate-y-0.5 transition-transform'
              }
            >
              <div
                className={
                  'w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary'
                }
              >
                <span className={'material-symbols-outlined text-[20px]'}>
                  {'battery_charging_full'}
                </span>
              </div>
              <div className={'text-left'}>
                <p
                  className={
                    'font-caption text-caption text-on-surface-variant uppercase tracking-wider'
                  }
                >
                  {'Thời lượng thực'}
                </p>
                <p className={'font-label-md text-label-md text-on-surface font-semibold'}>
                  {'Khám phá thông số pin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
