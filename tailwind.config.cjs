/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class', // or 'media' or 'class'
	theme: {
		scale: {},
		extend: {
			height: {},
			maxWidth: {},
			colors: {
				primary: '#06C3EC',
				secondary: '#113EEE',
				terciary: '#26D470',
				primaryHover: '#1AADCD',
				secondaryHover: '#1532A6',
				terciaryHover: '#1CAC59',
				primaryActive: '#88D4E4',
				secondaryActive: '#4D71FF',
				terciaryActive: '#66E49C',
				success: '#26D470',
				successHover: '#1CAC59',
				successActive: '#66E49C',
				danger: '#F32F2F',
				dangerHover: '#D40F0F',
				dangerActive: '#F36C6C',
				warning: '#FF6C36',
				warningHover: '#E74C3C',
				warningActive: '#FF9C6C',
				native: {
					'gray-400': '#9CA3AF',
					'gray-500': '#6B7280',
					'blue-500': '#3B82F6',
					'yellow-300': '#FDE047',
					'violet-400': '#A78BFA',
					'orange-500': '#F97316',
					'amber-500': '#F59E0B'
				},
				custom: {
					green: '#62D0AD',
					red: '#F32F2F',
					blue: '#2E8ACF',
					orange: '#FF6C36',
					pink: '#FF418B',
					brown: '#B26500',
					violet: '#AF7CD4'
				},
				background: {
					base: '#15151B',
					card: '#231F29',
					field: '#E5E7EB'
				}
			},
			boxShadow: {
				'3xl': '-5px 20px 15px 5px rgba(0, 0, 0, 0.3)'
			},
			keyframes: {
				rightToLeft: {
					'0%': { transform: 'translateX(400px)' },
					'20%': { transform: 'translateX(300px)' },
					'40%': { transform: 'translateX(200px)' },
					'60%': { transform: 'translateX(100px)' },
					'80%': { transform: 'rotate(20deg)' },
					'100%': {}
				}
			},
			animation: {
				gallop: 'rightToLeft 1.5s linear'
			}
		},
		backgroundImage: {
			'gradient-base': 'linear-gradient(270deg, #2D89CF 0%, #5BC7B2 100%)',
			'gradient-purple': 'linear-gradient(270deg, #2A85D0 0%, #AF7CD4 100%)',
			'gradient-orange': 'linear-gradient(270deg, #E74C3C 0%, #F39C12 100%)',
			'gradient-brightorange': 'linear-gradient(270deg, #F39C12 100%, #E74C3C 100%)',
			'gradient-white':
				'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0.55%, rgba(255, 255, 255, 0.01) 100%)'
		}
	},
	variants: {
		extend: {}
	},
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/line-clamp')]
};
