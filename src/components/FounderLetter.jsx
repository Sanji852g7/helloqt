import { HeartStem, TapeStrip } from './Doodles'

const HEART_CLIP_PATH =
  'M0.5,0.978 C0.22,0.756 0.06,0.533 0.06,0.333 C0.06,0.167 0.18,0.044 0.32,0.044 C0.40,0.044 0.47,0.089 0.5,0.167 C0.53,0.089 0.60,0.044 0.68,0.044 C0.82,0.044 0.94,0.167 0.94,0.333 C0.94,0.533 0.78,0.756 0.5,0.978 Z'

const HEART_OUTLINE_PATH =
  'M50,88 C22,68 6,48 6,30 C6,15 18,4 32,4 C40,4 47,8 50,15 C53,8 60,4 68,4 C82,4 94,15 94,30 C94,48 78,68 50,88 Z'

const DECKLE_EDGE_CLIP =
  'polygon(0.0% 2.5%, 5.0% 0%, 10.0% 2.5%, 15.0% 0%, 20.0% 2.5%, 25.0% 0%, 30.0% 2.5%, 35.0% 0%, 40.0% 2.5%, 45.0% 0%, 50.0% 2.5%, 55.0% 0%, 60.0% 2.5%, 65.0% 0%, 70.0% 2.5%, 75.0% 0%, 80.0% 2.5%, 85.0% 0%, 90.0% 2.5%, 95.0% 0%, 100.0% 2.5%, 100% 5.0%, 97.5% 10.0%, 100% 15.0%, 97.5% 20.0%, 100% 25.0%, 97.5% 30.0%, 100% 35.0%, 97.5% 40.0%, 100% 45.0%, 97.5% 50.0%, 100% 55.0%, 97.5% 60.0%, 100% 65.0%, 97.5% 70.0%, 100% 75.0%, 97.5% 80.0%, 100% 85.0%, 97.5% 90.0%, 100% 95.0%, 97.5% 100.0%, 95.0% 100%, 90.0% 97.5%, 85.0% 100%, 80.0% 97.5%, 75.0% 100%, 70.0% 97.5%, 65.0% 100%, 60.0% 97.5%, 55.0% 100%, 50.0% 97.5%, 45.0% 100%, 40.0% 97.5%, 35.0% 100%, 30.0% 97.5%, 25.0% 100%, 20.0% 97.5%, 15.0% 100%, 10.0% 97.5%, 5.0% 100%, 0.0% 97.5%, 0% 95.0%, 2.5% 90.0%, 0% 85.0%, 2.5% 80.0%, 0% 75.0%, 2.5% 70.0%, 0% 65.0%, 2.5% 60.0%, 0% 55.0%, 2.5% 50.0%, 0% 45.0%, 2.5% 40.0%, 0% 35.0%, 2.5% 30.0%, 0% 25.0%, 2.5% 20.0%, 0% 15.0%, 2.5% 10.0%, 0% 5.0%, 2.5% 0.0%)'

/**
 * The "letter from Sanji" card used on both Home and About.
 * Keep this the single source of truth — do not copy/paste this markup elsewhere.
 */
export default function FounderLetter({ headingLevel = 'p' }) {
  const Heading = headingLevel

  return (
    <div className="relative mx-auto max-w-3xl">
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="founder-letter-heart-clip" clipPathUnits="objectBoundingBox">
            <path d={HEART_CLIP_PATH} />
          </clipPath>
        </defs>
      </svg>

      {/* postmark */}
      <div className="absolute -top-8 right-6 z-10 flex h-24 w-24 rotate-[8deg] items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gold-400 bg-cream shadow-soft sm:right-10">
        <img
          src="/media/helloqtlogo.JPG"
          alt="HelloQT logo"
          width="96"
          height="96"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="rounded-[1.5rem] bg-blush-100 p-4 shadow-lift sm:p-5">
        <div className="bg-cream" style={{ clipPath: DECKLE_EDGE_CLIP }}>
          <div className="grid gap-8 px-8 pb-10 pt-6 sm:px-14 sm:pb-14 sm:pt-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-12">
            <div className="relative mx-auto w-36 shrink-0 -rotate-6 sm:w-44">
              <TapeStrip className="absolute -top-3 left-1/2 z-10 -translate-x-1/2" />
              <div className="relative" style={{ aspectRatio: '100 / 130' }}>
                <img
                  src="/media/me.JPG"
                  alt="Sanji, the face behind HelloQT"
                  width="500"
                  height="650"
                  loading="lazy"
                  style={{
                    objectPosition: 'center 20%',
                    clipPath: 'url(#founder-letter-heart-clip)',
                  }}
                  className="h-full w-full bg-white object-cover"
                />
                <svg
                  viewBox="0 0 100 90"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full text-blush-500"
                >
                  <path d={HEART_OUTLINE_PATH} fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            <div>
              <HeartStem className="h-10 w-5 text-plum-400" />
              <Heading className="mt-2 font-script text-3xl text-blush-600 sm:text-4xl">
                A little note from me
              </Heading>
              <p className="mt-4 max-w-xl leading-relaxed text-plum-700">
                Hiya, I&apos;m Sanji 💕 Software developer by day, but a full-time makeup and
                beauty lover. HelloQT is a one-woman brand, just me, no team behind it.
              </p>
              <p className="mt-4 max-w-xl leading-relaxed text-plum-700">
                It started because I kept losing my lashes, one always went missing in my bag or
                just vanished, so I made ones that come with their own little box to live in.
                Durable and comfortable too, with flexible bands so you&apos;re not binning them
                after one wear.
              </p>
              <p className="mt-4 max-w-xl leading-relaxed text-plum-700">
                I pack every order myself. And this is only the start, I want to take HelloQT
                further than just lashes one day.
              </p>

              <div className="mt-6">
                <p className="font-script text-2xl text-plum-500">With love,</p>
                <p className="font-script text-3xl text-plum-700">xo, Sanji</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
