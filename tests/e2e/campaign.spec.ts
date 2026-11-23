import { test, expect, expectAccessible } from "./a11y";

for (const locale of ["en", "de"] as const) {
  const prefix = locale === "de" ? "/de" : "";
  test(`${locale}: save, read, update, and reject a tampered draft`, async ({ page, context }) => {
    await page.goto(`${prefix}/campaign-workshop`);
    const form = page.locator(".feature-choice");
    const choices = form.getByRole("checkbox");
    const title = (await form.locator("label strong").first().innerText()).trim();
    await choices.first().check();
    await form.getByRole("button").click();
    await expect(page).toHaveURL(/saved=1/);
    await expect(choices.first()).toBeChecked();
    await expect(choices.last()).not.toBeChecked();
    const cookie = (await context.cookies()).find((item) => item.name === "campaign-draft");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
    await expectAccessible(page);
    await form.getByRole("link").click();
    await expect(page).toHaveURL(`${prefix}/campaign-workshop/draft`);
    await expect(page.locator("h1")).toContainText(title);
    await expect(page.locator(".feature-grid .feature")).toHaveCount(1);
    await expect(page.locator(".campaign-action__form")).toHaveCount(0);
    await expectAccessible(page);
    await page.reload();
    await expect(page.locator("h1")).toContainText(title);
    await page.locator(".draft-banner a").click();
    await choices.last().check();
    await form.getByRole("button").click();
    await expect(page).toHaveURL(/saved=1/);
    await form.getByRole("link").click();
    await expect(page.locator(".feature-grid .feature")).toHaveCount(2);
    await expectAccessible(page);

    const saved = (await context.cookies()).find((item) => item.name === "campaign-draft")!;
    const [payload, signature] = saved.value.split(".");
    await context.addCookies([{ ...saved, value: `${payload}.${signature[0] === "a" ? "b" : "a"}${signature.slice(1)}` }]);
    await page.reload();
    await expect(page.locator(".draft-banner")).toContainText(locale === "de"
      ? "Noch keine Workshop-Inhalte ausgewählt." : "No workshop features chosen yet.");
    await expect(page.locator(".feature-grid")).toHaveCount(0);
    await expectAccessible(page);
    await page.goto(`${prefix}/campaign-workshop`);
    await expect(choices.first()).not.toBeChecked();
    await expect(choices.last()).not.toBeChecked();
  });

  test(`${locale}: empty choices do not create a draft`, async ({ page, context }) => {
    await page.goto(`${prefix}/campaign-workshop`);
    await page.locator(".feature-choice").getByRole("button").click();
    await expect(page.locator("#feature-choice-error")).toBeVisible();
    expect((await context.cookies()).find((item) => item.name === "campaign-draft")).toBeUndefined();
    await expectAccessible(page);
  });

  test(`${locale}: invalid lead focus, server error, and mocked success`, async ({ page }) => {
    // Support an existing local build with a public test site key as well as seed mode.
    await page.addInitScript(() => {
      let callback: (token: string) => void = () => {};
      Object.assign(window, { turnstile: {
        render: (_element: unknown, options: { callback: typeof callback }) => {
          callback = options.callback;
          return "e2e";
        },
        execute: () => callback("e2e-token"),
        reset: () => {}, remove: () => {},
      } });
    });
    await page.goto(`${prefix}/campaign-workshop?utm_source=e2e&utm_campaign=proof`);
    const form = page.locator(".campaign-action__form");
    const email = form.locator('input[name="email"]');
    const consent = form.locator('input[name="consent"]');
    const submissions: Record<string, unknown>[] = [];
    let status = 429;
    await page.route("**/api/lead", async (route) => {
      submissions.push(route.request().postDataJSON());
      await route.fulfill({ status, json: status === 200 ? { ok: true, mode: "demo" } : { error: "rate_limited" } });
    });
    await expect(async () => {
      await form.getByRole("button").click();
      await expect(email).toBeFocused();
      await expect(form.locator('[aria-invalid="true"]')).toHaveCount(2);
    }).toPass();
    expect(submissions).toHaveLength(0);
    await expectAccessible(page);
    await email.fill("not-an-email");
    await form.getByRole("button").click();
    await expect(email).toBeFocused();
    expect(submissions).toHaveLength(0);
    await email.fill("e2e@example.com");
    await form.getByRole("button").click();
    await expect(consent).toBeFocused();
    await expectAccessible(page);
    await consent.check();
    await form.getByRole("button").click();
    await expect(page.locator('.campaign-action__status[data-tone="error"]')).toContainText(locale === "de" ? "Zu viele" : "Too many");
    await expect(email).toHaveValue("e2e@example.com");
    await expectAccessible(page);
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({ email: "e2e@example.com", consent: true, utm_source: "e2e", utm_campaign: "proof" });
    status = 200;
    await form.getByRole("button").click();
    const success = page.locator(".campaign-action__success");
    await expect(success).toBeFocused();
    await expect(success).toContainText("e2e@example.com");
    await expect(form).toBeHidden();
    expect(submissions).toHaveLength(2);
    await expectAccessible(page);
  });
}
