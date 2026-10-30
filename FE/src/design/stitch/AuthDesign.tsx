// Converted from dang_ki/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function AuthDesign() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <header className={"fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-variant transition-all duration-200"}>
        <div className={"h-[72px] max-w-[1280px] mx-auto px-gutter flex items-center justify-between"}>
          <div className={"flex items-center gap-space-lg"}>
            <a className={"flex items-center gap-space-sm group"} data-path={"trang-chu"} href={"#"}>
              <img alt={"SmartPhone AI Logo"} className={"h-8 w-auto object-contain"} src={"/images/c346f6d9e5d584cf.webp"} />
              <span className={"font-headline-sm text-headline-sm tracking-tight text-on-surface"}>
{"SmartPhone "}
                <span className={"text-secondary"}>
{"AI"}
                </span>
              </span>
            </a>
          </div>
          <nav className={"hidden md:flex items-center gap-space-xl"}>
            <a className={"font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"} data-path={"trang-chu"} href={"#"}>
{"Trang chủ"}
            </a>
            <a className={"font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"} data-path={"chi-tiet-san-pham"} href={"#"}>
{"Điện thoại"}
            </a>
            <a className={"font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"} data-path={"chi-tiet-san-pham"} href={"#"}>
{"So sánh"}
            </a>
            <a className={"inline-flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs group"} data-path={"chon-chu-de-ai"} href={"#"}>
              <span className={"relative flex h-2 w-2"}>
                <span className={"animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"}>

                </span>
                <span className={"relative inline-flex rounded-full h-2 w-2 bg-secondary"}>

                </span>
              </span>
{"Tư vấn AI"}
              <span className={"px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption uppercase tracking-wider"}>
{"Mới"}
              </span>
            </a>
          </nav>
          <div className={"flex items-center gap-space-md"}>
            <button aria-label={"Tìm kiếm thiết bị"} className={"w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"} type={"button"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"search"}
              </span>
            </button>
            <button aria-label={"Giỏ hàng"} className={"relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"} type={"button"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"shopping_bag"}
              </span>
              <span className={"absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary font-caption text-caption font-bold"}>
{"2"}
              </span>
            </button>
            <div className={"relative group pl-space-xs"}>
              <button className={"flex items-center gap-space-sm p-1 pr-2 rounded-full hover:bg-surface-container transition-all"} type={"button"}>
                <img alt={"Profile"} className={"w-8 h-8 rounded-full object-cover"} src={"/images/714dddc7bc860b08.webp"} />
                <span className={"hidden lg:block font-label-md text-label-md text-on-surface"}>
{"Minh Hoàng"}
                </span>
                <span className={"material-symbols-outlined text-outline text-[18px]"}>
{"expand_more"}
                </span>
              </button>
              <div className={"absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.1)] border border-surface-variant p-space-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50"}>
                <div className={"px-3 py-2 border-b border-surface-variant mb-1"}>
                  <p className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"Đang đăng nhập"}
                  </p>
                  <p className={"font-label-md text-label-md text-on-surface font-semibold truncate"}>
{"minh.hoang@example.vn"}
                  </p>
                </div>
                <a className={"flex items-center gap-space-sm px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} href={"#"}>
                  <span className={"material-symbols-outlined text-[18px]"}>
{"person"}
                  </span>
{"Tài khoản của tôi"}
                </a>
                <a className={"flex items-center gap-space-sm px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} href={"#"}>
                  <span className={"material-symbols-outlined text-[18px]"}>
{"receipt_long"}
                  </span>
{"Đơn hàng của tôi"}
                </a>
                <a className={"flex items-center gap-space-sm px-3 py-2 rounded-lg font-body-sm text-body-sm text-secondary hover:bg-secondary-fixed/50 transition-colors"} data-path={"tro-ly-ai-va-xac-nhan-chuyen-chu-de"} href={"#"}>
                  <span className={"material-symbols-outlined text-[18px]"}>
{"auto_awesome"}
                  </span>
{"Lịch sử AI"}
                </a>
                <div className={"border-t border-surface-variant my-1"}>

                </div>
                <a className={"flex items-center gap-space-sm px-3 py-2 rounded-lg font-body-sm text-body-sm text-error hover:bg-error-container/30 transition-colors"} href={"#"}>
                  <span className={"material-symbols-outlined text-[18px]"}>
{"logout"}
                  </span>
{"Đăng xuất"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className={"w-full pt-[72px] bg-surface flex-1"}>
        <div className={"flex flex-col w-full"}>
          <div className={"w-full max-w-[1280px] mx-auto px-gutter py-space-md"}>
            <nav aria-label={"Đường dẫn trang"} className={"flex items-center gap-2 font-caption text-caption text-on-surface-variant"}>
              <a className={"hover:text-primary transition-colors flex items-center gap-1"} href={"#"}>
                <span className={"material-symbols-outlined text-[15px]"}>
{"home"}
                </span>
                <span>
{"Trang chủ"}
                </span>
              </a>
              <span className={"material-symbols-outlined text-[14px] text-outline"}>
{"chevron_right"}
              </span>
              <span className={"hover:text-primary transition-colors cursor-pointer"}>
{"Tài khoản"}
              </span>
              <span className={"material-symbols-outlined text-[14px] text-outline"}>
{"chevron_right"}
              </span>
              <span className={"text-on-surface font-semibold"}>
{"Đăng nhập & Đăng ký"}
              </span>
            </nav>
          </div>
          <section className={"w-full max-w-[1280px] mx-auto px-gutter pb-space-2xl pt-space-xs"}>
            <div className={"relative w-full max-w-[1020px] mx-auto rounded-xl bg-surface-container-lowest shadow-xl overflow-hidden"}>
              <div className={"grid grid-cols-1 lg:grid-cols-12 min-h-[640px]"}>
                <div className={"lg:col-span-5 bg-surface-container-low p-space-xl flex flex-col justify-between relative overflow-hidden"}>
                  <div className={"absolute -top-24 -left-24 w-72 h-72 rounded-full bg-secondary-fixed/50 blur-3xl pointer-events-none"}>

                  </div>
                  <div className={"absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-primary-fixed/40 blur-2xl pointer-events-none"}>

                  </div>
                  <div className={"relative z-10 flex flex-col gap-space-lg"}>
                    <div className={"flex items-center gap-space-sm"}>
                      <span className={"inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-on-secondary shadow-sm"}>
                        <span className={"material-symbols-outlined text-[20px]"}>
{"auto_awesome"}
                        </span>
                      </span>
                      <div className={"flex flex-col"}>
                        <span className={"font-headline-sm text-headline-sm tracking-tight text-on-surface font-bold leading-none"}>
{"SmartPhone "}
                          <span className={"text-secondary"}>
{"AI"}
                          </span>
                        </span>
                        <span className={"font-caption text-caption text-on-surface-variant tracking-wider uppercase mt-0.5"}>
{"Hệ sinh thái thông minh"}
                        </span>
                      </div>
                    </div>
                    <div className={"flex flex-col gap-1.5 pt-space-xs"}>
                      <span className={"font-caption text-caption uppercase tracking-wider text-secondary font-semibold"}>
{"Đặc quyền hội viên"}
                      </span>
                      <h2 className={"font-headline-md text-headline-md text-on-surface font-bold tracking-tight"}>
{"Trải nghiệm mua sắm chuẩn xác hơn với AI."}
                      </h2>
                      <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
{" Đăng nhập để đồng bộ dữ liệu so sánh, tinh chỉnh cấu hình tự động và theo dõi lộ trình đơn hàng thời gian thực. "}
                      </p>
                    </div>
                    <div className={"flex flex-col gap-space-md pt-space-xs"}>
                      <div className={"flex items-start gap-space-sm p-3 rounded-lg bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm transition-all hover:bg-surface-container-lowest"}>
                        <div className={"w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 mt-0.5"}>
                          <span className={"material-symbols-outlined text-[18px]"}>
{"history"}
                          </span>
                        </div>
                        <div className={"flex flex-col"}>
                          <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Lưu lịch sử tư vấn AI"}
                          </span>
                          <span className={"font-body-sm text-body-sm text-on-surface-variant leading-snug mt-0.5"}>
{"Tiếp tục các cuộc trò chuyện và phân tích so sánh điện thoại chuyên sâu mọi lúc."}
                          </span>
                        </div>
                      </div>
                      <div className={"flex items-start gap-space-sm p-3 rounded-lg bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm transition-all hover:bg-surface-container-lowest"}>
                        <div className={"w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0 mt-0.5"}>
                          <span className={"material-symbols-outlined text-[18px]"}>
{"local_shipping"}
                          </span>
                        </div>
                        <div className={"flex flex-col"}>
                          <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Theo dõi đơn hàng COD"}
                          </span>
                          <span className={"font-body-sm text-body-sm text-on-surface-variant leading-snug mt-0.5"}>
{"Cập nhật tức thời trạng thái kiểm tra hàng trước khi thanh toán tiền mặt."}
                          </span>
                        </div>
                      </div>
                      <div className={"flex items-start gap-space-sm p-3 rounded-lg bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm transition-all hover:bg-surface-container-lowest"}>
                        <div className={"w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary-container shrink-0 mt-0.5"}>
                          <span className={"material-symbols-outlined text-[18px]"}>
{"psychology"}
                          </span>
                        </div>
                        <div className={"flex flex-col"}>
                          <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Ưu tiên trải nghiệm RAG"}
                          </span>
                          <span className={"font-body-sm text-body-sm text-on-surface-variant leading-snug mt-0.5"}>
{"Hệ thống thông minh gợi ý thiết bị theo thói quen và ngân sách cá nhân của bạn."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={"relative z-10 pt-space-lg flex items-center justify-between"}>
                    <div className={"flex items-center gap-2"}>
                      <span className={"relative flex h-2.5 w-2.5"}>
                        <span className={"animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"}>

                        </span>
                        <span className={"relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"}>

                        </span>
                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant font-medium"}>
{"Neural Engine v4.2 Sẵn sàng"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1 font-caption text-caption text-on-surface-variant"}>
                      <span className={"material-symbols-outlined text-[16px] text-primary"}>
{"verified_user"}
                      </span>
                      <span>
{"Bảo mật thiết bị"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={"lg:col-span-7 p-space-xl flex flex-col justify-between bg-surface-container-lowest"}>
                  <div className={"w-full"}>
                    <div className={"inline-flex p-1 bg-surface-container rounded-full w-full mb-space-lg"}>
                      <button className={"flex-1 py-2 px-4 rounded-full font-label-md text-label-md transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm bg-surface-container-lowest text-on-surface font-semibold"} id={"tab-btn-login"} type={"button"}>
                        <span className={"material-symbols-outlined text-[18px]"}>
{"login"}
                        </span>
                        <span>
{"Đăng nhập"}
                        </span>
                      </button>
                      <button className={"flex-1 py-2 px-4 rounded-full font-label-md text-label-md transition-all duration-200 flex items-center justify-center gap-1.5 text-on-surface-variant hover:text-on-surface font-medium"} id={"tab-btn-register"} type={"button"}>
                        <span className={"material-symbols-outlined text-[18px]"}>
{"person_add"}
                        </span>
                        <span>
{"Đăng ký tài khoản"}
                        </span>
                      </button>
                    </div>
                    <div className={"flex flex-col gap-space-md transition-opacity duration-200"} id={"panel-login"}>
                      <div className={"flex flex-col gap-1"}>
                        <h3 className={"font-headline-md text-headline-md text-on-surface font-bold tracking-tight"}>
{"Chào mừng trở lại"}
                        </h3>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{" Đăng nhập để quản lý đơn hàng COD và lịch sử tư vấn AI của bạn. "}
                        </p>
                      </div>
                      <form className={"flex flex-col gap-space-md pt-space-xs"}>
                        <div className={"flex flex-col gap-1.5"}>
                          <label className={"font-label-sm text-label-sm text-on-surface font-medium flex items-center justify-between"} htmlFor={"login-identifier"}>
                            <span>
{"Email hoặc Số điện thoại"}
                            </span>
                            <span className={"font-caption text-caption text-secondary flex items-center gap-0.5"}>
                              <span className={"material-symbols-outlined text-[13px]"}>
{"spark"}
                              </span>
{" Tự nhận diện "}
                            </span>
                          </label>
                          <div className={"relative flex items-center"}>
                            <span className={"material-symbols-outlined absolute left-3.5 text-outline text-[18px] pointer-events-none"}>
{"alternate_email"}
                            </span>
                            <input className={"w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg pl-10 pr-10 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all"} id={"login-identifier"} placeholder={"ten@vidu.vn hoặc 09xx xxx xxx"} required={true} type={"text"} defaultValue={"minh.hoang@example.vn"} />
                            <span className={"material-symbols-outlined absolute right-3.5 text-[#16A34A] text-[18px]"} title={"Định dạng hợp lệ"}>
{"check_circle"}
                            </span>
                          </div>
                        </div>
                        <div className={"flex flex-col gap-1.5"}>
                          <div className={"flex items-center justify-between"}>
                            <label className={"font-label-sm text-label-sm text-on-surface font-medium"} htmlFor={"login-password"}>
{"Mật khẩu"}
                            </label>
                            <a className={"font-caption text-caption text-primary hover:underline transition-colors"} href={"#"}>
{"Quên mật khẩu?"}
                            </a>
                          </div>
                          <div className={"relative flex items-center"}>
                            <span className={"material-symbols-outlined absolute left-3.5 text-outline text-[18px] pointer-events-none"}>
{"lock"}
                            </span>
                            <input className={"w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg pl-10 pr-10 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all tracking-wider"} id={"login-password"} placeholder={"Nhập mật khẩu của bạn"} required={true} type={"password"} defaultValue={"••••••••••••"} />
                            <button aria-label={"Ẩn hiện mật khẩu"} className={"absolute right-3.5 text-outline hover:text-on-surface focus:outline-none"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className={"flex items-center justify-between py-1"}>
                          <label className={"flex items-center gap-2 cursor-pointer select-none"}>
                            <input defaultChecked={true} className={"w-4 h-4 rounded text-primary focus:ring-primary-container border-outline-variant cursor-pointer accent-primary"} type={"checkbox"} />
                            <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Ghi nhớ đăng nhập trên thiết bị này"}
                            </span>
                          </label>
                        </div>
                        <button className={"w-full py-3.5 px-6 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-md transition-all duration-150 flex items-center justify-center gap-2 mt-1 active:scale-[0.99]"} type={"submit"}>
                          <span>
{"Đăng nhập vào SmartPhone AI"}
                          </span>
                          <span className={"material-symbols-outlined text-[18px]"}>
{"arrow_forward"}
                          </span>
                        </button>
                      </form>
                      <div className={"text-center pt-2"}>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{" Chưa có tài khoản thành viên? "}
                          <button className={"text-secondary font-semibold hover:underline"} type={"button"}>
{" Tạo tài khoản mới "}
                          </button>
                        </p>
                      </div>
                    </div>
                    <div className={"hidden flex flex-col gap-space-md transition-opacity duration-200"} id={"panel-register"}>
                      <div className={"flex flex-col gap-1"}>
                        <h3 className={"font-headline-md text-headline-md text-on-surface font-bold tracking-tight"}>
{"Tạo tài khoản SmartPhone AI"}
                        </h3>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{" Gia nhập để kích hoạt trợ lý AI và nhận bảo hành điện tử chính hãng. "}
                        </p>
                      </div>
                      <form className={"flex flex-col gap-space-sm pt-space-xs"}>
                        <div className={"flex flex-col gap-1"}>
                          <label className={"font-label-sm text-label-sm text-on-surface font-medium"} htmlFor={"reg-name"}>
{"Họ và tên"}
                          </label>
                          <div className={"relative flex items-center"}>
                            <span className={"material-symbols-outlined absolute left-3.5 text-outline text-[18px] pointer-events-none"}>
{"badge"}
                            </span>
                            <input className={"w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg pl-10 pr-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary-container transition-all"} id={"reg-name"} placeholder={"Ví dụ: Nguyễn Minh Hoàng"} required={true} type={"text"} />
                          </div>
                        </div>
                        <div className={"grid grid-cols-1 sm:grid-cols-2 gap-space-sm"}>
                          <div className={"flex flex-col gap-1"}>
                            <label className={"font-label-sm text-label-sm text-on-surface font-medium"} htmlFor={"reg-email"}>
{"Địa chỉ Email"}
                            </label>
                            <div className={"relative flex items-center"}>
                              <span className={"material-symbols-outlined absolute left-3.5 text-outline text-[18px] pointer-events-none"}>
{"mail"}
                              </span>
                              <input className={"w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-container transition-all"} id={"reg-email"} placeholder={"minh.hoang@email.com"} required={true} type={"email"} />
                            </div>
                          </div>
                          <div className={"flex flex-col gap-1"}>
                            <label className={"font-label-sm text-label-sm text-on-surface font-medium flex items-center justify-between"} htmlFor={"reg-phone"}>
                              <span>
{"Số điện thoại"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"Xác nhận COD"}
                              </span>
                            </label>
                            <div className={"relative flex items-center"}>
                              <span className={"material-symbols-outlined absolute left-3.5 text-outline text-[18px] pointer-events-none"}>
{"smartphone"}
                              </span>
                              <input className={"w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-container transition-all"} id={"reg-phone"} placeholder={"0912 345 678"} required={true} type={"tel"} />
                            </div>
                          </div>
                        </div>
                        <div className={"flex flex-col gap-1"}>
                          <div className={"flex items-center justify-between"}>
                            <label className={"font-label-sm text-label-sm text-on-surface font-medium"} htmlFor={"reg-password"}>
{"Mật khẩu mới"}
                            </label>
                            <span className={"font-caption text-caption text-[#16A34A] font-semibold flex items-center gap-1"}>
                              <span className={"material-symbols-outlined text-[14px]"}>
{"shield"}
                              </span>
{" Bảo mật cao "}
                            </span>
                          </div>
                          <div className={"relative flex items-center"}>
                            <span className={"material-symbols-outlined absolute left-3.5 text-outline text-[18px] pointer-events-none"}>
{"lock"}
                            </span>
                            <input className={"w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-primary-container transition-all tracking-wider"} id={"reg-password"} placeholder={"Ít nhất 8 ký tự, bao gồm chữ & số"} required={true} type={"password"} defaultValue={"VnSmartAI#2025!"} />
                            <button aria-label={"Ẩn hiện mật khẩu"} className={"absolute right-3.5 text-outline hover:text-on-surface focus:outline-none"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"visibility"}
                              </span>
                            </button>
                          </div>
                          <div className={"grid grid-cols-4 gap-1.5 pt-1"}>
                            <div className={"h-1 rounded-full bg-[#16A34A]"}>

                            </div>
                            <div className={"h-1 rounded-full bg-[#16A34A]"}>

                            </div>
                            <div className={"h-1 rounded-full bg-[#16A34A]"}>

                            </div>
                            <div className={"h-1 rounded-full bg-[#16A34A]"}>

                            </div>
                          </div>
                        </div>
                        <div className={"flex flex-col gap-1"}>
                          <label className={"font-label-sm text-label-sm text-on-surface font-medium"} htmlFor={"reg-confirm-password"}>
{"Xác nhận lại mật khẩu"}
                          </label>
                          <div className={"relative flex items-center"}>
                            <span className={"material-symbols-outlined absolute left-3.5 text-outline text-[18px] pointer-events-none"}>
{"verified"}
                            </span>
                            <input className={"w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-primary-container transition-all tracking-wider"} id={"reg-confirm-password"} placeholder={"Nhập lại mật khẩu vừa tạo"} required={true} type={"password"} defaultValue={"VnSmartAI#2025!"} />
                            <span className={"material-symbols-outlined absolute right-3.5 text-[#16A34A] text-[18px]"}>
{"check"}
                            </span>
                          </div>
                        </div>
                        <div className={"py-1"}>
                          <label className={"flex items-start gap-2 cursor-pointer select-none"}>
                            <input className={"w-4 h-4 rounded text-secondary focus:ring-secondary-container border-outline-variant cursor-pointer accent-secondary mt-0.5"} required={true} type={"checkbox"} />
                            <span className={"font-body-sm text-body-sm text-on-surface-variant leading-tight"}>
{" Tôi đồng ý với "}
                              <a className={"text-primary hover:underline"} href={"#"}>
{"Điều khoản dịch vụ"}
                              </a>
{" và "}
                              <a className={"text-primary hover:underline"} href={"#"}>
{"Chính sách bảo mật"}
                              </a>
{" của SmartPhone AI. "}
                            </span>
                          </label>
                        </div>
                        <button className={"w-full py-3.5 px-6 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md font-semibold shadow-md transition-all duration-150 flex items-center justify-center gap-2 mt-1 active:scale-[0.99]"} type={"submit"}>
                          <span className={"material-symbols-outlined text-[18px]"}>
{"verified_user"}
                          </span>
                          <span>
{"Tạo tài khoản ngay"}
                          </span>
                        </button>
                      </form>
                      <div className={"text-center pt-1"}>
                        <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{" Đã có tài khoản? "}
                          <button className={"text-primary font-semibold hover:underline"} type={"button"}>
{" Đăng nhập tại đây "}
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={"pt-space-lg mt-space-md border-t border-surface-variant/40 flex flex-col sm:flex-row items-center justify-between gap-space-xs text-center sm:text-left"}>
                    <div className={"flex items-center gap-1.5 font-caption text-caption text-on-surface-variant"}>
                      <span className={"material-symbols-outlined text-[16px] text-primary"}>
{"lock_clock"}
                      </span>
                      <span>
{"Mã hóa chuẩn SSL 256-bit • Bảo vệ quyền riêng tư tuyệt đối"}
                      </span>
                    </div>
                    <span className={"font-caption text-caption text-secondary font-medium flex items-center gap-1"}>
                      <span className={"material-symbols-outlined text-[14px]"}>
{"format_image_left"}
                      </span>
{" Xác thực an toàn "}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className={"w-full bg-surface-container-low border-t border-surface-variant mt-auto"}>
        <div className={"max-w-[1280px] mx-auto px-gutter pt-space-2xl pb-space-xl"}>
          <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl pb-space-xl border-b border-surface-variant"}>
            <div className={"flex flex-col gap-space-md"}>
              <div className={"flex items-center gap-space-sm"}>
                <span className={"font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold"}>
{"SmartPhone "}
                  <span className={"text-secondary"}>
{"AI"}
                  </span>
                </span>
              </div>
              <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
{"Hệ thống bán lẻ điện thoại thông minh tích hợp trí tuệ nhân tạo hàng đầu Việt Nam. Mua sắm thông minh, lựa chọn chính xác."}
              </p>
              <div className={"flex items-center gap-2 pt-space-xs"}>
                <span className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-surface-variant font-label-sm text-label-sm text-on-surface-variant"}>
                  <span className={"material-symbols-outlined text-[16px] text-[#16A34A]"}>
{"verified"}
                  </span>
{"Đại lý ủy quyền chính hãng"}
                </span>
              </div>
            </div>
            <div className={"flex flex-col gap-space-sm"}>
              <h3 className={"font-label-md text-label-md text-on-surface font-semibold tracking-wide"}>
{"Khám phá"}
              </h3>
              <ul className={"flex flex-col gap-2 mt-1"}>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"iPhone (Apple)"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"Samsung Galaxy"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"Xiaomi"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"OPPO"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"vivo"}
                </li>
                <li className={"font-body-sm text-body-sm text-secondary font-medium hover:underline transition-all cursor-pointer flex items-center gap-1"}>
{"Điện thoại AI Thế hệ mới "}
                  <span className={"material-symbols-outlined text-[14px]"}>
{"north_east"}
                  </span>
                </li>
              </ul>
            </div>
            <div className={"flex flex-col gap-space-sm"}>
              <h3 className={"font-label-md text-label-md text-on-surface font-semibold tracking-wide"}>
{"Hỗ trợ & Chính sách"}
              </h3>
              <ul className={"flex flex-col gap-2 mt-1"}>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"Chính sách bảo hành 12 tháng"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"Đổi trả trong 7 ngày"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1"}>
{"Kiểm tra đơn hàng COD"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"}>
{"Hướng dẫn mua hàng trả góp 0%"}
                </li>
              </ul>
            </div>
            <div className={"flex flex-col gap-space-sm"}>
              <h3 className={"font-label-md text-label-md text-secondary font-semibold tracking-wide flex items-center gap-1.5"}>
                <span className={"material-symbols-outlined text-[18px]"}>
{"smart_toy"}
                </span>
{"Trợ lý AI"}
              </h3>
              <ul className={"flex flex-col gap-2 mt-1"}>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"}>
{"Tư vấn cấu hình theo nhu cầu"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"}>
{"So sánh điện thoại thông minh"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"}>
{"Giải đáp chính sách RAG"}
                </li>
                <li className={"font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"}>
{"Trò chuyện công nghệ 24/7"}
                </li>
              </ul>
            </div>
          </div>
          <div className={"pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md font-caption text-caption text-on-surface-variant"}>
            <div className={"flex flex-wrap items-center gap-space-md"}>
              <span className={"flex items-center gap-1 font-medium text-on-surface"}>
                <span className={"material-symbols-outlined text-[16px] text-primary"}>
{"call"}
                </span>
{"Hotline: 1800-8899 (Miễn phí)"}
              </span>
              <span className={"text-outline-variant"}>
{"|"}
              </span>
              <span className={"inline-flex items-center gap-1 text-[#16A34A] font-medium"}>
                <span className={"material-symbols-outlined text-[15px]"}>
{"local_shipping"}
                </span>
{"Thanh toán COD an toàn khi nhận hàng"}
              </span>
            </div>
            <div>
{"© 2025 SmartPhone AI Retail. Thiết kế tối giản chuẩn công nghệ cao cấp."}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
