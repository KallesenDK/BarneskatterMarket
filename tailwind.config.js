/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				light: '#D41E3F',
  				dark: '#A00B28'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  				light: '#002B7A',
  				dark: '#001845'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				border: 'hsl(var(--card-border))',
  				shadow: 'hsl(var(--card-shadow))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			text: {
  				primary: 'hsl(var(--text-primary))',
  				secondary: 'hsl(var(--text-secondary))',
  				muted: 'hsl(var(--text-muted))'
  			},
  			brand: {
  				teal: '#1AA49A',
  				pink: '#BC1964',
  				orange: '#F08319'
  			},
  			norway: {
  				red: '#BA0C2F',
  				blue: '#00205B',
  				white: '#FFFFFF'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			'appear': 'appear 1s ease forwards',
  			'appear-zoom': 'appear-zoom 1s ease forwards',
  			'background-gradient': 'background-gradient 10s linear infinite'
  		},
  		keyframes: {
  			'appear': {
  				'0%': {
  					opacity: 0,
  					transform: 'translateY(16px)'
  				},
  				'100%': {
  					opacity: 1,
  					transform: 'translateY(0)'
  				}
  			},
  			'appear-zoom': {
  				'0%': {
  					opacity: 0,
  					transform: 'translateY(16px) scale(0.9)'
  				},
  				'100%': {
  					opacity: 1,
  					transform: 'translateY(0) scale(1)'
  				}
  			},
  			'background-gradient': {
  				'0%, 100%': {
  					transform: 'translate(var(--tx-1, -50%), var(--ty-1, -50%))'
  				},
  				'25%': {
  					transform: 'translate(var(--tx-2, 50%), var(--ty-2, -50%))'
  				},
  				'50%': {
  					transform: 'translate(var(--tx-3, 50%), var(--ty-3, 50%))'
  				},
  				'75%': {
  					transform: 'translate(var(--tx-4, -50%), var(--ty-4, 50%))'
  				}
  			}
  		},
  		backdropBlur: {
  			xs: '2px',
  			sm: '4px',
  			md: '8px',
  			lg: '12px',
  			xl: '16px',
  			'2xl': '24px'
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
      require("tailwindcss-animate")
],
} 