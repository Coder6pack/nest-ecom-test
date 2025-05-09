import { Body, Container, Head, Heading, Html, Img, Link, Section, Text } from '@react-email/components'
import * as React from 'react'
interface OTPEmailProps {
	otpCode: string
	title: string
}

const logoUrl = 'https://iconlogovector.com/uploads/images/2023/02/lg-5dc7a1642cbd5d0557dd6714e0074c1659.jpg'
export const OTPEmail = ({ otpCode, title }: OTPEmailProps) => (
	<Html>
		<Head>
			<title>{title}</title>
		</Head>
		<Body style={main}>
			<Container style={container}>
				<Img src={logoUrl} alt="Logo" style={logo} />
				<Text style={tertiary}>Mã xác thực</Text>
				<Heading style={secondary}>Đây là mã xác thực của bạn vui lòng không chia sẽ cho bất kỳ ai</Heading>
				<Section style={codeContainer}>
					<Text style={code}>{otpCode}</Text>
				</Section>
				<Text style={paragraph}>Not expecting this email?</Text>
				<Text style={paragraph}>
					Contact{' '}
					<Link href="mailto:login@plaid.com" style={link}>
						login@plaid.com
					</Link>{' '}
					if you did not request this code.
				</Text>
			</Container>
			<Text style={footer}>Securely powered by Plaid.</Text>
		</Body>
	</Html>
)

OTPEmail.PreviewProps = {
	otpCode: '144833',
	title: 'OTP code',
} as OTPEmailProps

export default OTPEmail

const main = {
	backgroundColor: '#ffffff',
	fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
}

const container = {
	backgroundColor: '#ffffff',
	border: '1px solid #eee',
	borderRadius: '5px',
	boxShadow: '0 5px 10px rgba(20,50,70,.2)',
	marginTop: '20px',
	maxWidth: '360px',
	margin: '0 auto',
	padding: '68px 0 130px',
}

const logo = {
	margin: '0 auto',
	borderRadius: '50%',
	width: '80px',
	height: '80px',
}

const tertiary = {
	color: '#0a85ea',
	fontSize: '11px',
	fontWeight: 700,
	fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
	height: '16px',
	letterSpacing: '0',
	lineHeight: '16px',
	margin: '16px 8px 8px 8px',
	textTransform: 'uppercase' as const,
	textAlign: 'center' as const,
}

const secondary = {
	color: '#000',
	display: 'inline-block',
	fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
	fontSize: '20px',
	fontWeight: 500,
	lineHeight: '24px',
	marginBottom: '0',
	marginTop: '0',
	textAlign: 'center' as const,
}

const codeContainer = {
	background: 'rgba(0,0,0,.05)',
	borderRadius: '4px',
	margin: '16px auto 14px',
	verticalAlign: 'middle',
	width: '280px',
}

const code = {
	color: '#000',
	fontFamily: 'HelveticaNeue-Bold',
	fontSize: '32px',
	fontWeight: 700,
	letterSpacing: '6px',
	lineHeight: '40px',
	paddingBottom: '8px',
	paddingTop: '8px',
	margin: '0 auto',
	display: 'block',
	textAlign: 'center' as const,
}

const paragraph = {
	color: '#444',
	fontSize: '15px',
	fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
	letterSpacing: '0',
	lineHeight: '23px',
	padding: '0 40px',
	margin: '0',
	textAlign: 'center' as const,
}

const link = {
	color: '#444',
	textDecoration: 'underline',
}

const footer = {
	color: '#000',
	fontSize: '12px',
	fontWeight: 800,
	letterSpacing: '0',
	lineHeight: '23px',
	margin: '0',
	marginTop: '20px',
	fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
	textAlign: 'center' as const,
	textTransform: 'uppercase' as const,
}
