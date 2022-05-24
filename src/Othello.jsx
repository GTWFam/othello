import React from "react";
import { loadOthello, resetOthello } from "../assets/scripts/othelloGame";

class Othello extends React.Component {
  componentDidMount() {
    loadOthello();
  }
  render() {
    return (
      <>
        <div className="container has-text-centered">
          <h2 className="pb-4 is-size-2 has-text-black has-text-weight-semibold">
            Othello Project
          </h2>
          <div className="columns">
            <div className="column is-flex is-justify-content-center is-align-items-center">
              <button className="button is-info">Rules</button>
              <p
                className="mx-5 is-size-3 is-uppercase is-bold has-text-info-dark"
                id="othelloMessage"
              >
                Let's play Othello!
              </p>
              <button onClick={resetOthello} className="button is-info">
                Reset
              </button>
            </div>
          </div>
          <div className="columns">
            <div className="column is-flex is-justify-content-end">
              <p className="has-text-white is-size-3">
                <span id="w_player"></span>: <span id="w_score"></span>
              </p>
            </div>
            <div className="column is-flex is-justify-content-center">
              <canvas id="othello" width="563" height="563"></canvas>
            </div>
            <div className="column is-flex is-justify-content-start">
              <p className="has-text-black is-size-3">
                <span id="b_player"></span>: <span id="b_score"></span>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Othello;
