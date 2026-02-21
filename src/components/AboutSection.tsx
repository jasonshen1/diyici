import labImg from "@/assets/ab-mode.jpg";

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-[#F0F0E8] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-pink-600 rounded-2xl rotate-3 opacity-10 blur-xl transform scale-105" />
            <img 
              src={labImg} 
              alt="小样实验室" 
              className="relative rounded-2xl shadow-2xl border border-white/50 w-full object-cover hover:rotate-1 transition-transform duration-500"
            />
          </div>

          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-6">
              品牌宣言
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#4A4A4A] mb-6 leading-tight">
              关于阿一和第一次
            </h2>
            <div className="space-y-6 text-lg text-[#91A398] leading-relaxed">
              <p className="font-medium text-pink-800">
                亲爱的顾客，我是阿一，diyici.ai 的店长和首席配方师。
              </p>
              <p>
                阿一认为，智能只有零次和无数次。我们不卖复杂的工具，只卖你需要的第一次成功体验。
              </p>
              <p>
                很多人问，为什么叫「第一次」？因为我发现，90% 的人对智能 的恐惧源于从未真正「搞定」过一件事。
              </p>
              <p className="italic text-[#91A398] font-medium">
                在这里，智能只有零次和无数次。
              </p>
              <p>
                我相信，当你第一次轻松搞定一件事，你会发现 智能其实可以如此贴心。就像你第一次试用高品质护肤品，从此再也离不开它。
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
