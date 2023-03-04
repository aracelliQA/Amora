import React from "react";
import styled from "@emotion/styled";

export const XummModal = ({ isModalOpen, imageUrl, closeModal }) => {
  const Shadow = styled.div`
    position: fixed;
    width: 100vw;
    height: 100vh;
    z-index: 999;
    inset: 0px;
    background-color: #00000024;
  `;

  const Container = styled.div`
    position: absolute;
    background-color: #fff;
    border-radius: 8px;
    min-height: 200px;
    min-width: 200px;
    z-index: 1000;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    padding: 8px 16px 32px;
  `;

  const titleStyle = {
    fontWeight: 600,
    fontSize: "16px",
    marginBottom: "16px",
  };

  return (
    <>
      {isModalOpen && (
        <Shadow onClick={closeModal}>
          <Container>
            <h2 style={titleStyle}>
              Sign in using your Xumm App to unlock perks!
            </h2>
            <div style={{ width: "250px", height: "250px", margin: "0 auto" }}>
              <img
                style={{ width: "100%", height: "100%" }}
                src={imageUrl}
              ></img>
            </div>
          </Container>
        </Shadow>
      )}
    </>
  );
};
