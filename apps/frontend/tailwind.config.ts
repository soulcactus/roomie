import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Pretendard',
  				'var(--font-inter)',
  				'system-ui',
  				'sans-serif'
  			],
  			brand: [
  				'var(--font-outfit)',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			brand: {
  				primary: 'hsl(var(--brand-primary))',
  				'primary-light': 'hsl(var(--brand-primary-light))',
  				text: 'hsl(var(--brand-text))',
  				surface: 'hsl(var(--brand-surface))',
  				'gradient-start': 'hsl(var(--brand-gradient-start))',
  				'gradient-mid': 'hsl(var(--brand-gradient-mid))',
  				'gradient-end': 'hsl(var(--brand-gradient-end))',
  				'cta-from': 'hsl(var(--brand-cta-from))',
  				'cta-to': 'hsl(var(--brand-cta-to))',
  				info: 'hsl(var(--brand-info))',
  				placeholder: 'hsl(var(--brand-placeholder))',
  				'danger-border': 'hsl(var(--brand-danger-border))',
  				'danger-bg': 'hsl(var(--brand-danger-bg))',
  				'danger-text': 'hsl(var(--brand-danger-text))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
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
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
