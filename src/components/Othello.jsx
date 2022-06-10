import React from "react";
import { Container, Row, Col, Button, Offcanvas } from "react-bootstrap";
import { loadOthello, resetOthello } from "../public/scripts/othelloGame";
import Rules from "./Rules";
import GA4React from "ga-4-react";

class Othello extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
    this.toggleShow = this.toggleShow.bind(this);
  }

  componentDidMount() {
    fetch(`/getGACode`, { method: "get", "no-cors": true })
      .then((res) => res.json())
      .then((data) => {
        const ga4react = new GA4React(data.GA_CODE);
        ga4react.initialize();
      })
      .then(() => {
        loadOthello();
      });
  }

  toggleShow() {
    this.setState((state) => {
      return { show: !state.show };
    });
  }

  render() {
    const { show } = this.state;
    return (
      <>
        <Container fluid className="my-3">
          <Row className="my-2">
            <Col className="d-flex justify-content-end align-items-center">
              <Button size="lg" variant="info" onClick={this.toggleShow}>
                Rules
              </Button>
            </Col>
            <Col
              md="auto"
              className="d-flex justify-content-center align-items-center"
            >
              <span className="fs-1" id="othelloMessage">
                Let's play Othello!
              </span>
            </Col>
            <Col className="d-flex justify-content-start align-items-center">
              <Button size="lg" onClick={resetOthello} variant="warning">
                Reest
              </Button>
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-end">
              <p className="text-light fs-2">
                <span id="w_player"></span>: <span id="w_score"></span>
              </p>
            </Col>
            <Col className="d-flex justify-content-center">
              <canvas id="othello" width="563" height="563"></canvas>
            </Col>
            <Col className="d-flex justify-content-start">
              <p className="fs-2">
                <span id="b_player"></span>: <span id="b_score"></span>
              </p>
            </Col>
          </Row>
        </Container>

        <Offcanvas show={show} onHide={this.toggleShow} backdrop={false}>
          <Offcanvas.Header closeButton className="rules-header">
            <Offcanvas.Title>Othello Rules</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="rules">
            <Rules />
          </Offcanvas.Body>
        </Offcanvas>
      </>
    );
  }
}

export default Othello;
