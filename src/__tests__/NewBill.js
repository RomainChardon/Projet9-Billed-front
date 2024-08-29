/**
 * @jest-environment jsdom
 */

import {screen, waitFor, getByTestId, fireEvent} from "@testing-library/dom"
import "@testing-library/jest-dom";
import mockStore from "../__mocks__/store.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import {bills} from "../fixtures/bills.js";
import userEvent from "@testing-library/user-event";

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


    test("test adding file with the correct format", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");

      const file = new File(["../assets/images/facturefreemobile.jpg"], "image.jpg", {
            type: "image/jpg",
          });
      await waitFor(() => {
        inputFile.addEventListener("change", handleChangeFile);

        fireEvent.change(inputFile, {
          target: {
            files: [
              file
            ],
          },
        });
        userEvent.upload(inputFile, file);
      })

      expect(handleChangeFile).toBeCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();

    })

    test("test adding file with the wrong format", async () => {
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
            new File(["../assets/images/test.txt"], "test.txt", {
              type: "application/txt",
            }),
          ],
        },
      });

      expect(handleChangeFile).toBeCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.getAllByTestId("error-file")).toBeTruthy();
    })

    test("test upload", async () => {
      const newBillForm = screen.getByTestId("form-new-bill");
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})
