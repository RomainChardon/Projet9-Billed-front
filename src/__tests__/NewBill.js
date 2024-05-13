/**
 * @jest-environment jsdom
 */

import {screen, waitFor, getByTestId, fireEvent} from "@testing-library/dom"
import "@testing-library/jest-dom";
import mockStore from "../__mocks__/store.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import {ROUTES_PATH} from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";

jest.mock("../app/Store.js", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
    })

    test("Then mail icon in vertical layout should be highlighted", async () => {

      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')
    })

    test("add file", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["../assets/images/facturefreemobile.jpg"], "image.jpg", {
              type: "image/jpg",
            }),
          ],
        },
      });

      expect(handleChangeFile).toBeCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();

    })

    test("test type file", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");

      global.alert = jest.fn();

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["../assets/images/facturefreemobile.jpg"], "facturefreemobile.jpg", {
              type: "image/jpg",
            }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
    })
  })

  // TODO post test
  describe("new bill submit form", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {value: localStorageMock});
      window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    describe("valid form", () => {
      test("update api", async () => {
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localeStorage: localStorageMock,
        });
        const handleSubmit = jest.fn(newBill.handleSubmit);
        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(mockStore.bills).toHaveBeenCalled();
      });
    });
  })
})
