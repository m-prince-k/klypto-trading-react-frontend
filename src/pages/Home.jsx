import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap.min.css";
import SEO from "../components/SEO";

const Home = () => {
  return (
    <>
      <SEO
        title="Best Crypto Trading Platform"
        description="Trade crypto instantly with low fees"
        keywords="crypto, trading, bitcoin, ethereum"
        url="https://yourdomain.com/"
        image="https://yourdomain.com/banner.jpg"
      />
      <Helmet>
        <title>Klypto – Advanced Crypto Trading Charts & Indicators</title>
        <meta
          name="description"
          content="Klypto is a powerful crypto trading platform with advanced charts, technical indicators and real-time market analysis tools."
        />
        <meta
          name="keywords"
          content="klypto, crypto trading charts, bitcoin chart tools, trading indicators, crypto analysis platform"
        />
      </Helmet>

      <Container fluid className="py-5">
        {/* HERO SECTION */}
        <Container className="text-center mb-5">
          <Row className="justify-content-center">
            <Col lg={8}>
              <h1 className="fw-bold mb-3">
                Klypto – Smart Crypto Trading Charts & Indicators
              </h1>

              <p className="text-muted">
                Klypto is a powerful cryptocurrency trading analysis platform
                built for modern traders. Analyze crypto markets with advanced
                indicators, real-time charts and professional trading tools.
              </p>

              <div className="mt-4">
                <Button variant="primary" size="lg" className="me-3">
                  Start Trading
                </Button>

                <Button variant="outline-dark" size="lg">
                  Explore Charts
                </Button>
              </div>
            </Col>
          </Row>
        </Container>

        {/* FEATURES */}
        <Container className="mb-5">
          <Row className="text-center mb-4">
            <Col>
              <h2 className="fw-bold">Advanced Crypto Trading Tools</h2>
            </Col>
          </Row>

          <Row className="g-4">
            <Col md={6} lg={3}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>Real-Time Crypto Charts</Card.Title>
                  <Card.Text>
                    Track cryptocurrency markets with fast real-time charts
                    powered by professional trading tools.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>Technical Indicators</Card.Title>
                  <Card.Text>
                    Use indicators like RSI, SMA, EMA, WMA and Supertrend to
                    analyze market trends and opportunities.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>Custom Indicators</Card.Title>
                  <Card.Text>
                    Build and save custom trading indicators with flexible
                    configuration options.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>Drawing Tools</Card.Title>
                  <Card.Text>
                    Use trendlines, Fibonacci retracement and patterns to
                    perform professional technical analysis.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* WHY CHOOSE */}
        <Container className="mb-5">
          <Row className="text-center mb-4">
            <Col>
              <h2 className="fw-bold">Why Traders Choose Klypto</h2>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8}>
              <ul className="list-group list-group-flush text-center">
                <li className="list-group-item">
                  ⚡ Lightning Fast Chart Performance
                </li>
                <li className="list-group-item">
                  📊 Professional Technical Indicators
                </li>
                <li className="list-group-item">
                  📈 Real-Time Binance Market Data
                </li>
                <li className="list-group-item">
                  🎯 Customizable Trading Interface
                </li>
                <li className="list-group-item">
                  🔒 Secure Trading Environment
                </li>
              </ul>
            </Col>
          </Row>
        </Container>

        {/* CTA */}
        <Container className="text-center mb-5">
          <Row className="justify-content-center">
            <Col lg={7}>
              <h2 className="fw-bold">Start Your Crypto Trading Journey</h2>

              <p className="text-muted mt-3">
                Join Klypto and experience next-generation crypto charting tools
                designed for professional traders and investors.
              </p>

              <Button variant="dark" size="lg" className="mt-3">
                Get Started Now
              </Button>
            </Col>
          </Row>
        </Container>

        {/* SEO CONTENT */}
        <Container>
          <Row className="justify-content-center">
            <Col lg={9}>
              <p className="text-muted text-center">
                Klypto is an advanced cryptocurrency charting and trading
                analysis platform that helps traders understand market trends
                using professional technical indicators and powerful charting
                tools. Analyze Bitcoin, Ethereum and other crypto assets with
                real-time data and make smarter trading decisions.
              </p>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
};

export default Home;
