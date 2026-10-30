// Converted from c_u_h_nh_ai_smartphone_ai_admin/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function AiSettingsDesign() {
  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased">
      <aside className={"fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between pt-6 pb-6"}>
        <div className={"flex flex-col"}>
          <div className={"px-6 mb-8 flex items-center justify-between"}>
            <div className={"flex items-center gap-2.5"}>
              <div className={"w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary"}>
                <span className={"material-symbols-outlined text-[20px]"}>
{"auto_awesome"}
                </span>
              </div>
              <div className={"flex flex-col"}>
                <span className={"font-headline-sm text-label-md text-on-surface font-semibold tracking-tight"}>
{"SmartPhone AI"}
                </span>
                <span className={"font-caption text-caption text-secondary font-medium tracking-wide"}>
{"ADMIN PORTAL"}
                </span>
              </div>
            </div>
          </div>
          <nav className={"px-3 flex flex-col gap-1"}>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"tong-quan"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"dashboard"}
              </span>
              <span>
{"Tổng quan"}
              </span>
            </a>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"quan-ly-san-pham"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"smartphone"}
              </span>
              <span>
{"Quản lý sản phẩm"}
              </span>
            </a>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"quan-ly-don-hang"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"receipt_long"}
              </span>
              <span>
{"Quản lý đơn hàng"}
              </span>
            </a>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"kho-kien-thuc-ai"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"dataset"}
              </span>
              <span>
{"Kho kiến thức AI"}
              </span>
            </a>
            <a aria-current={"page"} className={"flex items-center gap-3 px-3.5 py-2.5 transition-all bg-primary text-on-primary font-medium rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)]"} data-path={"cau-hinh-ai"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"tune"}
              </span>
              <span>
{"Cấu hình AI"}
              </span>
            </a>
          </nav>
        </div>
        <div className={"px-3 flex flex-col gap-3"}>
          <a className={"flex items-center justify-between px-3.5 py-2.5 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} href={"/"}>
{"Quay lại cửa hàng"}
          </a>
          <div className={"p-3 bg-surface-container-low rounded-xl flex items-center gap-3"}>
            <div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"}>
              <span className={"material-symbols-outlined text-on-primary text-[18px]"}>
{"person"}
              </span>
            </div>
            <div className={"flex flex-col min-w-0 flex-1"}>
              <span className={"font-label-sm text-label-sm text-on-surface font-medium truncate"}>
{"Quản trị viên"}
              </span>
              <span className={"font-caption text-caption text-on-surface-variant truncate"}>
{"Super Admin"}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div className={"pl-[260px]"}>
        <header className={"fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-8 flex items-center justify-between"}>
          <div className={"flex items-center gap-2"}>
            <span className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"SmartPhone AI"}
            </span>
            <span className={"font-caption text-caption text-outline"}>
{"/"}
            </span>
            <span className={"font-label-sm text-label-sm text-on-surface font-medium"}>
{"Bảng điều khiển"}
            </span>
          </div>
          <div className={"flex items-center gap-5"}>
            <div className={"hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low"}>
              <span className={"w-2 h-2 rounded-full bg-primary-container animate-pulse"}>

              </span>
              <span className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"Hệ thống AI: Hoạt động"}
              </span>
            </div>
            <div className={"hidden md:flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant"}>
              <span className={"material-symbols-outlined text-[16px]"}>
{"schedule"}
              </span>
              <span>
{"Hôm nay"}
              </span>
            </div>
            <button className={"w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} type={"button"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"notifications"}
              </span>
            </button>
            <div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}>
              <span className={"material-symbols-outlined text-on-primary text-[18px]"}>
{"person"}
              </span>
            </div>
          </div>
        </header>
        <main className={"w-full pt-16 bg-background min-h-screen"}>
          <div className={"flex flex-col w-full"}>
            <div className={"max-w-[1280px] w-full mx-auto px-8 py-8 flex flex-col gap-8"}>
              <div className={"flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2"}>
                <div className={"flex flex-col gap-1.5"}>
                  <div className={"flex items-center gap-2"}>
                    <span className={"font-caption text-caption uppercase tracking-wider text-secondary font-semibold"}>
{"Production AI Engine"}
                    </span>
                    <span className={"w-1 h-1 rounded-full bg-outline-variant"}>

                    </span>
                    <span className={"font-caption text-caption text-on-surface-variant"}>
{"v2.4.0-prod"}
                    </span>
                  </div>
                  <h1 className={"font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight"}>
{"Cấu hình nhà cung cấp AI"}
                  </h1>
                  <p className={"font-body-md text-body-md text-on-surface-variant max-w-2xl"}>
{"Quản lý model và khóa API cho hệ thống Trợ lý AI và module RAG thông minh của SmartPhone AI"}
                  </p>
                </div>
                <div className={"inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-container-low shadow-sm"}>
                  <div className={"w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-primary"}>
                    <span className={"material-symbols-outlined text-[16px]"}>
{"lock"}
                    </span>
                  </div>
                  <span className={"font-label-sm text-label-sm text-on-surface font-medium"}>
{"Khóa API được mã hóa đầu cuối 256-bit và lưu trữ an toàn"}
                  </span>
                </div>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
                <div className={"relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-6 cursor-pointer group"}>
                  <div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-primary"}>

                  </div>
                  <div className={"flex flex-col gap-4"}>
                    <div className={"flex items-start justify-between gap-4"}>
                      <div className={"flex items-center gap-3.5"}>
                        <div className={"w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shadow-sm"}>
                          <span className={"material-symbols-outlined text-[26px]"}>
{"spark"}
                          </span>
                        </div>
                        <div className={"flex flex-col"}>
                          <div className={"flex items-center gap-2"}>
                            <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{"Google Gemini"}
                            </h3>
                            <span className={"px-2 py-0.5 rounded-full bg-secondary-fixed font-caption text-caption text-secondary font-medium"}>
{"Khuyên dùng"}
                            </span>
                          </div>
                          <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Gemini 1.5 Pro"}
                          </span>
                        </div>
                      </div>
                      <div className={"flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low"}>
                        <span className={"relative flex h-2 w-2"}>
                          <span className={"animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"}>

                          </span>
                          <span className={"relative inline-flex rounded-full h-2 w-2 bg-primary"}>

                          </span>
                        </span>
                        <span className={"font-label-sm text-label-sm text-on-surface font-medium"}>
{"Đang hoạt động (Primary)"}
                        </span>
                      </div>
                    </div>
                    <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
{" Tối ưu hóa đặc biệt cho khả năng đọc hiểu ngữ cảnh RAG dài, so sánh thông số kỹ thuật điện thoại đa nguồn và xử lý tiếng Việt tự nhiên chuẩn xác cao. "}
                    </p>
                  </div>
                  <div className={"flex items-center justify-between pt-4 bg-surface-container-low/60 -mx-6 -mb-6 px-6 py-3.5 rounded-b-xl"}>
                    <div className={"flex items-center gap-4"}>
                      <div className={"flex items-center gap-1.5 text-on-surface-variant"}>
                        <span className={"material-symbols-outlined text-[16px] text-primary"}>
{"speed"}
                        </span>
                        <span className={"font-body-sm text-body-sm"}>
{"Độ trễ: "}
                          <strong className={"text-on-surface font-semibold"}>
{"190ms"}
                          </strong>
                        </span>
                      </div>
                      <span className={"text-outline-variant font-caption"}>
{"•"}
                      </span>
                      <div className={"flex items-center gap-1.5 text-on-surface-variant"}>
                        <span className={"material-symbols-outlined text-[16px] text-secondary"}>
{"verified"}
                        </span>
                        <span className={"font-body-sm text-body-sm"}>
{"Độ tin cậy: "}
                          <strong className={"text-on-surface font-semibold"}>
{"99.9%"}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <span className={"material-symbols-outlined text-secondary text-[20px]"}>
{"check_circle"}
                    </span>
                  </div>
                </div>
                <div className={"relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-6 cursor-pointer group"}>
                  <div className={"flex flex-col gap-4"}>
                    <div className={"flex items-start justify-between gap-4"}>
                      <div className={"flex items-center gap-3.5"}>
                        <div className={"w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant shadow-sm"}>
                          <span className={"material-symbols-outlined text-[26px]"}>
{"psychology"}
                          </span>
                        </div>
                        <div className={"flex flex-col"}>
                          <div className={"flex items-center gap-2"}>
                            <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{"OpenAI"}
                            </h3>
                            <span className={"px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption text-on-surface-variant font-medium"}>
{"Dự phòng"}
                            </span>
                          </div>
                          <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"GPT-4o"}
                          </span>
                        </div>
                      </div>
                      <div className={"flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low"}>
                        <span className={"inline-flex rounded-full h-2 w-2 bg-outline"}>

                        </span>
                        <span className={"font-label-sm text-label-sm text-on-surface-variant font-medium"}>
{"Sẵn sàng dự phòng (Standby)"}
                        </span>
                      </div>
                    </div>
                    <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
{" Hệ thống dự phòng tự động chuyển mạch (auto-failover) khi có sự cố mạng hoặc lưu lượng truy vấn vượt ngưỡng giới hạn hạn ngạch. "}
                    </p>
                  </div>
                  <div className={"flex items-center justify-between pt-4 bg-surface-container-low/60 -mx-6 -mb-6 px-6 py-3.5 rounded-b-xl"}>
                    <div className={"flex items-center gap-4"}>
                      <div className={"flex items-center gap-1.5 text-on-surface-variant"}>
                        <span className={"material-symbols-outlined text-[16px]"}>
{"speed"}
                        </span>
                        <span className={"font-body-sm text-body-sm"}>
{"Độ trễ: "}
                          <strong className={"text-on-surface font-semibold"}>
{"220ms"}
                          </strong>
                        </span>
                      </div>
                      <span className={"text-outline-variant font-caption"}>
{"•"}
                      </span>
                      <div className={"flex items-center gap-1.5 text-on-surface-variant"}>
                        <span className={"material-symbols-outlined text-[16px]"}>
{"alt_route"}
                        </span>
                        <span className={"font-body-sm text-body-sm"}>
{"Tự động kích hoạt khi lỗi"}
                        </span>
                      </div>
                    </div>
                    <button className={"font-label-sm text-label-sm text-primary hover:text-primary-container font-medium flex items-center gap-1"} type={"button"}>
                      <span>
{"Thiết lập"}
                      </span>
                      <span className={"material-symbols-outlined text-[16px]"}>
{"arrow_forward"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className={"bg-surface-container-lowest rounded-xl p-8 shadow-sm flex flex-col gap-8"}>
                <div className={"flex items-center justify-between pb-4"}>
                  <div className={"flex items-center gap-3"}>
                    <div className={"w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary"}>
                      <span className={"material-symbols-outlined text-[18px]"}>
{"tune"}
                      </span>
                    </div>
                    <div className={"flex flex-col"}>
                      <h2 className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{"Cấu hình chi tiết - Google Gemini"}
                      </h2>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Thiết lập tham số môi trường production cho SmartPhone AI Engine"}
                      </span>
                    </div>
                  </div>
                  <div className={"flex items-center gap-2"}>
                    <span className={"px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm"}>
{"Active Profile"}
                    </span>
                  </div>
                </div>
                <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
                  <div className={"flex flex-col gap-2"}>
                    <label className={"font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"}>
                      <span>
{"Nhà cung cấp AI"}
                      </span>
                      <span className={"font-caption text-caption text-secondary"}>
{"Chính thức"}
                      </span>
                    </label>
                    <div className={"relative"}>
                      <select className={"w-full h-11 px-4 pr-10 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary"} defaultValue={"gemini"}>
                        <option value={"gemini"}>
{"Google Gemini (Mặc định hệ thống)"}
                        </option>
                        <option value={"openai"}>
{"OpenAI"}
                        </option>
                      </select>
                      <span className={"material-symbols-outlined pointer-events-none absolute right-3.5 top-3 text-[20px] text-on-surface-variant"}>
{"expand_more"}
                      </span>
                    </div>
                    <span className={"font-caption text-caption text-on-surface-variant"}>
{"Tất cả truy vấn tìm kiếm RAG và tư vấn sản phẩm sẽ ưu tiên routing qua provider này."}
                    </span>
                  </div>
                  <div className={"flex flex-col gap-2"}>
                    <label className={"font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"}>
                      <span>
{"Mô hình Chat (Chat Model)"}
                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Context window: 1M tokens"}
                      </span>
                    </label>
                    <div className={"relative"}>
                      <select className={"w-full h-11 px-4 pr-10 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary"} defaultValue={"gemini-1.5-pro-latest"}>
                        <option value={"gemini-1.5-pro-latest"}>
{"gemini-1.5-pro-latest (Chuyên sâu RAG)"}
                        </option>
                        <option value={"gemini-1.5-flash"}>
{"gemini-1.5-flash (Tốc độ phản hồi cực nhanh)"}
                        </option>
                      </select>
                      <span className={"material-symbols-outlined pointer-events-none absolute right-3.5 top-3 text-[20px] text-on-surface-variant"}>
{"expand_more"}
                      </span>
                    </div>
                    <span className={"font-caption text-caption text-on-surface-variant"}>
{"gemini-1.5-pro cung cấp độ chính xác phân tích thông số chip, pin và so sánh giá cao nhất."}
                    </span>
                  </div>
                  <div className={"flex flex-col gap-2"}>
                    <label className={"font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"}>
                      <span>
{"Mô hình Vector Embedding (RAG Module)"}
                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"768 dimensions"}
                      </span>
                    </label>
                    <div className={"relative"}>
                      <input className={"w-full h-11 px-4 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none cursor-default font-mono"} readOnly={true} type={"text"} defaultValue={"text-embedding-004"} />
                      <span className={"absolute right-3.5 top-3 text-secondary material-symbols-outlined text-[18px]"}>
{"verified"}
                      </span>
                    </div>
                    <span className={"font-caption text-caption text-on-surface-variant"}>
{"Đồng bộ với cơ sở dữ liệu Vector Pinecone chứa kho thông số hơn 1.200 mẫu điện thoại."}
                    </span>
                  </div>
                  <div className={"flex flex-col gap-2"}>
                    <label className={"font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"}>
                      <span>
{"Giới hạn độ dài phản hồi (Max Output Tokens)"}
                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Đề xuất: 2048"}
                      </span>
                    </label>
                    <div className={"relative flex items-center"}>
                      <input className={"w-full h-11 px-4 pr-20 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"} type={"number"} defaultValue={"2048"} />
                      <span className={"absolute right-4 font-caption text-caption text-on-surface-variant uppercase"}>
{"tokens"}
                      </span>
                    </div>
                    <span className={"font-caption text-caption text-on-surface-variant"}>
{"Đảm bảo câu trả lời tư vấn ngắn gọn, đủ bảng so sánh mà không gây nghẽn giao diện khách hàng."}
                    </span>
                  </div>
                </div>
                <div className={"flex flex-col gap-2 p-5 rounded-xl bg-surface-container-low/70"}>
                  <label className={"font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"}>
                    <div className={"flex items-center gap-2"}>
                      <span className={"material-symbols-outlined text-[18px] text-primary"}>
{"key"}
                      </span>
                      <span>
{"Gemini Production API Key"}
                      </span>
                    </div>
                    <span className={"font-caption text-caption text-on-surface-variant"}>
{"Lần cập nhật cuối: 3 ngày trước bởi Admin"}
                    </span>
                  </label>
                  <div className={"flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-1"}>
                    <div className={"relative flex-1"}>
                      <input className={"w-full h-11 px-4 pr-10 rounded-lg bg-surface-container-lowest font-mono text-body-sm text-on-surface focus:outline-none tracking-wider"} id={"apiKeyField"} readOnly={true} type={"password"} defaultValue={"AIzaSyBkL7x90qPzW4mNvR8tYuI2oK3jM9k9Lp"} />
                      <div className={"absolute right-3 top-2.5"}>
                        <span className={"material-symbols-outlined text-[20px] text-primary"}>
{"verified_user"}
                        </span>
                      </div>
                    </div>
                    <div className={"flex items-center gap-2 shrink-0"}>
                      <button className={"h-11 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors font-label-sm text-label-sm text-on-surface font-medium flex items-center gap-2"} id={"toggleKeyBtn"} type={"button"}>
                        <span className={"material-symbols-outlined text-[18px]"} id={"toggleKeyIcon"}>
{"visibility"}
                        </span>
                        <span id={"toggleKeyText"}>
{"Hiện Key"}
                        </span>
                      </button>
                      <button className={"h-11 px-4 rounded-lg bg-secondary-fixed hover:bg-secondary-fixed-dim transition-colors font-label-sm text-label-sm text-secondary font-medium flex items-center gap-2"} id={"changeKeyBtn"} type={"button"}>
                        <span className={"material-symbols-outlined text-[18px]"}>
{"find_replace"}
                        </span>
                        <span>
{"Thay thế Key mới"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className={"flex items-center gap-2 mt-1"}>
                    <span className={"material-symbols-outlined text-[16px] text-primary"}>
{"shield"}
                    </span>
                    <span className={"font-caption text-caption text-on-surface-variant"}>
{"Hệ thống bảo vệ hạn mức chi phí (Quota Alert): Ngưỡng kích hoạt cảnh báo $500/tháng."}
                    </span>
                  </div>
                </div>
                <div className={"flex flex-col gap-3 p-5 rounded-xl bg-surface-container-low/70"}>
                  <div className={"flex items-center justify-between"}>
                    <div className={"flex items-center gap-2"}>
                      <span className={"material-symbols-outlined text-[18px] text-secondary"}>
{"thermostat"}
                      </span>
                      <label className={"font-label-md text-label-md text-on-surface font-medium"} htmlFor={"tempRange"}>
{"Nhiệt độ sáng tạo (Temperature)"}
                      </label>
                    </div>
                    <div className={"flex items-center gap-2"}>
                      <span className={"px-2.5 py-0.5 rounded-lg bg-primary text-on-primary font-mono font-label-sm text-label-sm font-semibold"} id={"tempValue"}>
{"0.2"}
                      </span>
                      <span className={"font-caption text-caption text-secondary font-medium"}>
{"Tối ưu cho RAG"}
                      </span>
                    </div>
                  </div>
                  <input className={"w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"} id={"tempRange"} max={"1"} min={"0"} step={"0.05"} type={"range"} defaultValue={"0.2"} />
                  <div className={"flex items-center justify-between font-caption text-caption text-on-surface-variant"}>
                    <span>
{"0.0 (Chính xác tuyệt đối - Dành cho báo giá & thông số)"}
                    </span>
                    <span>
{"0.5 (Cân bằng)"}
                    </span>
                    <span>
{"1.0 (Sáng tạo tự do)"}
                    </span>
                  </div>
                  <p className={"font-caption text-caption text-on-surface-variant"}>
{" Giá trị đề xuất "}
                    <strong className={"text-on-surface"}>
{"0.2"}
                    </strong>
{": Hạn chế tối đa ảo giác (hallucination), đảm bảo thông số camera, vi xử lý và ưu đãi trả góp được trích xuất chính xác 100% từ cơ sở dữ liệu kho sản phẩm. "}
                  </p>
                </div>
                <div className={"flex flex-col gap-4 pt-2"}>
                  <div className={"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"}>
                    <div className={"flex flex-col"}>
                      <span className={"font-label-md text-label-md text-on-surface font-medium"}>
{"Kiểm tra tính sẵn sàng của hạ tầng AI"}
                      </span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>
{"Gửi truy vấn kiểm thử ping 16 token để đo thời gian phản hồi thực tế của máy chủ Google"}
                      </span>
                    </div>
                    <button className={"h-10 px-5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium flex items-center gap-2 transition-all"} id={"testConnBtn"} type={"button"}>
                      <span className={"material-symbols-outlined text-[18px]"} id={"testConnIcon"}>
{"sync"}
                      </span>
                      <span id={"testConnText"}>
{"Kiểm tra kết nối"}
                      </span>
                    </button>
                  </div>
                  <div className={"p-4 rounded-xl bg-surface-container-low flex items-start gap-3.5 transition-all"} id={"testResultBanner"}>
                    <div className={"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"check_circle"}
                      </span>
                    </div>
                    <div className={"flex flex-col gap-0.5 flex-1 min-w-0"}>
                      <div className={"flex items-center gap-2 flex-wrap"}>
                        <span className={"font-label-md text-label-md text-on-surface font-semibold"}>
{"Kết nối thành công!"}
                        </span>
                        <span className={"px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-medium"}>
{"Độ trễ: 165ms"}
                        </span>
                        <span className={"px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-caption text-caption font-medium"}>
{"Ping API: OK"}
                        </span>
                      </div>
                      <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{" API Key hợp lệ và model "}
                        <code className={"font-mono text-on-surface"}>
{"gemini-1.5-pro-latest"}
                        </code>
{" sẵn sàng phục vụ khách hàng trên toàn bộ storefront. "}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={"flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 bg-surface-container-lowest"}>
                  <button className={"w-full sm:w-auto h-11 px-6 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-md text-label-md text-on-surface font-medium transition-colors"} id={"resetBtn"} type={"button"}>
{" Đặt về mặc định "}
                  </button>
                  <button className={"w-full sm:w-auto h-11 px-8 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-medium shadow-sm transition-all flex items-center justify-center gap-2"} id={"saveBtn"} type={"button"}>
                    <span className={"material-symbols-outlined text-[18px]"}>
{"save"}
                    </span>
                    <span>
{"Lưu cấu hình"}
                    </span>
                  </button>
                </div>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>
                <div className={"p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-2"}>
                  <div className={"w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-1"}>
                    <span className={"material-symbols-outlined text-[22px]"}>
{"security"}
                    </span>
                  </div>
                  <h4 className={"font-headline-sm text-label-md text-on-surface font-semibold"}>
{"Bảo mật đa lớp"}
                  </h4>
                  <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{" Khóa API được lưu trữ trong Google Cloud Secret Manager và mã hóa chuẩn AES-256. Không lưu trữ trực tiếp dưới dạng plain-text. "}
                  </p>
                </div>
                <div className={"p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-2"}>
                  <div className={"w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-1"}>
                    <span className={"material-symbols-outlined text-[22px]"}>
{"swap_horiz"}
                    </span>
                  </div>
                  <h4 className={"font-headline-sm text-label-md text-on-surface font-semibold"}>
{"Tự động chuyển mạch (Failover)"}
                  </h4>
                  <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{" Nếu Google Gemini trả mã lỗi 5xx trong 3 lần liên tiếp, hệ thống tự động định tuyến toàn bộ hội thoại sang OpenAI GPT-4o trong vòng 0.4 giây. "}
                  </p>
                </div>
                <div className={"p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-2"}>
                  <div className={"w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary-container mb-1"}>
                    <span className={"material-symbols-outlined text-[22px]"}>
{"database"}
                    </span>
                  </div>
                  <h4 className={"font-headline-sm text-label-md text-on-surface font-semibold"}>
{"Đồng bộ RAG tức thì"}
                  </h4>
                  <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
{" Bất kỳ thay đổi giá hoặc thông số sản phẩm trong module 'Quản lý sản phẩm' sẽ tự động tái vector hóa sau 60 giây vào mô hình text-embedding-004. "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
