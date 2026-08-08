<Slider {...sliderSettings}>
          {posters.map((banner) => (
            <div key={banner._id} className={clsx('relative', 'w-full', 'h-auto', 'sm:h-[400px]', 'md:h-[480px]', 'lg:h-[560px]', 'overflow-hidden', 'rounded-lg')}>
              {/* Main Image covering full width */}
              <img
                decoding="async"
                loading="lazy"
                src={banner.posterImageUrl}
                alt={banner.offerTitle}
                className={clsx('absolute', 'inset-0', 'w-full', 'h-full', 'object-contain', 'sm:object-cover')}
              />

              {/* Poster Overlay */}
              <div className={clsx('absolute', 'inset-0', 'bg-gradient-to-r', 'from-black/70', 'via-black/50', 'to-transparent', 'z-20', 'flex', 'items-center', 'justify-center')}>
                <div className={clsx('w-full', 'max-w-7xl', 'mx-auto', 'px-2', 'sm:px-6', 'md:px-10', 'py-2', 'sm:py-6', 'flex', 'flex-col', 'sm:flex-row', 'items-center', 'justify-center', 'gap-2', 'sm:gap-4')}>
                  {/* Left Side - Text Content */}
                  <div className={clsx('flex-1', 'text-center', 'sm:text-left')}>
                    {/* Badge */}
                    {banner.offerType && (
                      <div className={clsx('inline-block', 'bg-orange-500', 'text-white', 'text-[10px]', 'sm:text-xs', 'font-bold', 'px-2', 'sm:px-3', 'py-0.5', 'sm:py-1', 'rounded-full', 'mb-1', 'sm:mb-2')}>
                        {banner.offerType} Special
                      </div>
                    )}

                    {/* Main Heading */}
                    <h2 className={clsx('text-lg', 'sm:text-4xl', 'md:text-5xl', 'font-black', 'text-white', 'mb-0.5', 'sm:mb-2', 'leading-tight', 'line-clamp-2', 'sm:line-clamp-1')}>
                      {banner.offerTitle}
                    </h2>

                    {/* Discount */}
                    {banner.discountPercentage > 0 && (
                      <div className={clsx('text-xl', 'sm:text-5xl', 'md:text-6xl', 'font-black', 'text-orange-400', 'mb-0.5', 'sm:mb-2')}>
                        {banner.discountPercentage}% OFF
                      </div>
                    )}

                    {/* Subtitle */}
                    {banner.offerDescription && (
                      <p className={clsx('text-[10px]', 'sm:text-base', 'md:text-lg', 'text-gray-200', 'line-clamp-1', 'sm:line-clamp-2', 'hidden', 'sm:block')}>
                        {banner.offerDescription}
                      </p>
                    )}
                  </div>

                  {/* Right Side - Timer */}
                  <div className={clsx('flex-shrink-0', 'hidden', 'sm:block')}>
                    <div className={clsx('bg-white/10', 'backdrop-blur-md', 'rounded-xl', 'p-2', 'sm:p-3', 'max-w-[280px]', 'sm:max-w-[340px]', 'border', 'border-white/20')}>
                      <p className={clsx('text-[10px]', 'sm:text-xs', 'text-white', 'text-center', 'mb-1', 'font-semibold')}>ENDS IN</p>
                      <div className={clsx('text-2xl', 'sm:text-4xl', 'md:text-5xl', 'font-bold', 'text-white', 'text-center', 'tabular-nums', 'leading-tight')}>
                        {timeLeft[banner._id] || "Loading..."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Icon - Top Right */}
                <button
                  onClick={() => setSelectedPoster(banner)}
                  className={clsx('absolute', 'top-3', 'right-3', 'w-8', 'h-8', 'bg-black/50', 'hover:bg-black/70', 'text-white', 'rounded-full', 'flex', 'items-center', 'justify-center', 'backdrop-blur-sm', 'transition-all', 'z-30')}
                  title="View Details"
                >
                  <FaInfo className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </Slider>