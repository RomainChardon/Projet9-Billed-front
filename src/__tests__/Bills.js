/**
 * @jest-environment jsdom
 */

import {screen, waitFor, getByTestId} from "@testing-library/dom"
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import mockStore from "../__mocks__/store.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import NewBill from "../containers/NewBill.js";

jest.mock("../app/Store.js", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')

    })
  })

  describe("When Employee Navigate on Bills Dashbord", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
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

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((new Date(a) < new Date(b)) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      // 1 - Sort bills fix test
      expect(datesSorted).toEqual(["2004-04-04", "2003-03-03", "2002-02-02", "2001-01-01"]);
    })

    test("test handleClickIconEye", () => {
      const bill = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });

      $.fn.modal = jest.fn();

      document.body.innerHTML = BillsUI({ data: bills })

      const iconEye = screen.getAllByTestId("btn-new-bill")[0];
      const handleClickIconEye = jest.fn(
          bill.handleClickIconEye(iconEye)
      );

      iconEye.addEventListener("click", handleClickIconEye);
      userEvent.click(iconEye);

      expect(handleClickIconEye).toHaveBeenCalled();
      expect($.fn.modal).toHaveBeenCalled();
      expect(screen.getByTestId("modalEye")).toBeTruthy();
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });

    test("fetches bills from an API", async () => {
      const bills = await mockStore.bills().list();
      expect(bills.length).toBe(4);
    });
  })
})
