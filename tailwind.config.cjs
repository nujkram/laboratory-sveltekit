/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
				sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
				mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
			},
			colors: {
				/* --- Brand system (derived from the est. 1997 pine-peak logo) --- */
				pine: {
					900: '#0F2E1D',
					800: '#143823',
					700: '#1B5E3F',
					600: '#22704B',
					500: '#2E8457'
				},
				leaf: {
					DEFAULT: '#46A02E',
					hover: '#3B8A27',
					active: '#63B94C',
					soft: '#EAF3E6'
				},
				paper: '#F4F7F1',
				surface: '#FFFFFF',
				ink: '#142218',
				muted: '#5B6B60',
				line: '#E1E8DE',

				/* --- Semantic tokens (names kept so existing pages adopt the brand automatically) --- */
				primary: '#1B5E3F',
				secondary: '#28382D',
				terciary: '#46A02E',
				primaryHover: '#154C33',
				secondaryHover: '#1B271F',
				terciaryHover: '#3B8A27',
				primaryActive: '#2E7A54',
				secondaryActive: '#3B4F42',
				terciaryActive: '#63B94C',
				success: '#2F9E44',
				successHover: '#26802F',
				successActive: '#54C266',
				danger: '#D33A2C',
				dangerHover: '#B32B20',
				dangerActive: '#E4685C',
				warning: '#D8880F',
				warningHover: '#B87209',
				warningActive: '#EBA637',

				/* --- Result-flag colors for clinical values --- */
				flag: {
					high: '#C42B1C',
					low: '#1D6FB8',
					normal: '#2F9E44'
				},

				custom: {
					green: '#46A02E',
					red: '#D33A2C',
					blue: '#2E8ACF',
					orange: '#D8880F',
					pink: '#FF418B',
					brown: '#B26500',
					violet: '#AF7CD4'
				}
			},
			borderRadius: {
				xl: '0.875rem'
			},
			boxShadow: {
				card: '0 1px 2px rgba(16, 46, 30, 0.04), 0 4px 16px -8px rgba(16, 46, 30, 0.12)',
				'card-lg': '0 2px 4px rgba(16, 46, 30, 0.05), 0 12px 32px -12px rgba(16, 46, 30, 0.18)',
				'3xl': '-5px 20px 15px 5px rgba(0, 0, 0, 0.3)'
			},
			keyframes: {
				'rise-in': {
					'0%': { opacity: '0', transform: 'translateY(12px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				}
			},
			animation: {
				'rise-in': 'rise-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
				'fade-in': 'fade-in 0.6s ease both'
			},
			backgroundImage: {
				'pine-fade': 'linear-gradient(180deg, #1B5E3F 0%, #143823 100%)'
			}
		}
	},
	variants: {
		extend: {}
	},
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/line-clamp')]
};
