"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardHeader, CardTitle, CardFooter, CardContent } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Divider from "@/components/ui/Divider";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import { Search, ShoppingCart, User, Mail, Lock, Truck, Zap, Store } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Grid, { GridItem } from "@/components/ui/Grid";
import { zodResolver } from "@hookform/resolvers/zod";
import RadioGroup from "@/components/ui/Radio";
import Dropdown from "@/components/ui/Dropdown";
import PriceRangeSlider from "@/components/ui/PriceRangeSlider";

// ✅ Zod schema for validation example
const formSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type FormData = z.infer<typeof formSchema>;

export default function UIDemoPage() {
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = React.useState("standard");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(20000000);
  const options = [
    {
      value: "standard",
      label: "Giao hàng tiêu chuẩn",
      description: "3–5 ngày làm việc",
      price: "Miễn phí",
    },
    {
      value: "express",
      label: "Giao nhanh",
      description: "1–2 ngày làm việc",
      price: "+50,000₫",
    },
    {
      value: "pickup",
      label: "Nhận tại cửa hàng",
      description: "Miễn phí, nhận trong 24h",
      price: "Miễn phí",
    },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    alert(`✅ Đăng nhập thành công!\nEmail: ${data.email}`);
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg-muted)] text-[var(--color-text-default)] py-12">
      <Container className="space-y-16">
        {/* PAGE TITLE */}
        <Heading level={1} className="text-[var(--color-brand-400)] mb-8 text-center">
          🎨 UI Components Demo
        </Heading>

        {/* ================= BUTTONS ================= */}
        <section>
          <Heading level={2} className="mb-4">
            🟢 Buttons
          </Heading>
          <div className="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading</Button>
            <Button leftIcon={<ShoppingCart size={16} />}>Left Icon</Button>
            <Button rightIcon={<User size={16} />}>Right Icon</Button>
            <Button fullWidth>Full Width Button</Button>
          </div>
        </section>

        <Divider />

        {/* ================= INPUTS ================= */}
        <section>
          <Heading level={2} className="mb-4">
            🟣 Inputs
          </Heading>
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Email" placeholder="example@email.com" />
            <Input
              label="Password"
              type="password"
              leftIcon={<User size={16} />}
              helperText="Must be at least 8 characters"
              required
            />
            <Input label="Search" rightIcon={<Search size={16} />} placeholder="Search products..." />
            <Input label="Error Example" error="This field is required" />
          </div>
        </section>

        <Divider />

        {/* ================= CARDS ================= */}
        <section>
          <Heading level={2} className="mb-4">
            🟤 Cards
          </Heading>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <Text muted>This is a simple default card.</Text>
              </CardContent>
              <Text muted>This is a simple default card.</Text>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="bordered" hoverable>
              <CardHeader>
                <CardTitle>Bordered Card</CardTitle>
              </CardHeader>
              <Text muted>This card has brand-colored borders.</Text>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </CardFooter>
            </Card>

            <Card variant="elevated" hoverable>
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
              </CardHeader>
              <Text muted>This card uses shadow for depth. Hover to see the subtle elevation.</Text>
              <CardFooter>
                <Button variant="secondary" size="sm">
                  Purchase
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <Divider />

        {/* ================= MODAL ================= */}
        <section>
          <Heading level={2} className="mb-4">
            🟠 Modal
          </Heading>
          <Button onClick={() => setOpenModal(true)}>Open Modal</Button>

          <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title="Example Modal" size="xl">
            <Text>
              This is an example modal. You can use it to display additional information, forms, or confirmation
              dialogs.
            </Text>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setOpenModal(false)}>
                Confirm
              </Button>
            </div>
          </Modal>
        </section>

        <Divider />

        {/* ================= BADGES & ALERTS ================= */}
        <section>
          <Heading level={2} className="mb-4">
            🟡 Badges & Alerts
          </Heading>
          <div className="flex gap-2 mb-6">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>

          <div className="space-y-3">
            <Alert title="Info" description="This is a general info message." />
            <Alert variant="success" title="Success" description="Operation completed successfully." />
            <Alert variant="warning" title="Warning" description="Please check the details carefully." />
            <Alert variant="error" title="Error" description="Something went wrong. Try again." />
          </div>
        </section>

        <Divider />

        {/* ================= TYPOGRAPHY & SPINNER ================= */}
        <section>
          <Heading level={2} className="mb-4">
            🔵 Typography & Spinner
          </Heading>
          <div className="space-y-3">
            <Heading level={1}>Heading 1</Heading>
            <Heading level={2}>Heading 2</Heading>
            <Heading level={3}>Heading 3</Heading>
            <Text>This is a normal paragraph using Text component.</Text>
            <Text muted>This is a muted text example.</Text>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <Spinner />
            <Spinner size={30} />
            <Spinner size={40} />
          </div>
        </section>

        <Divider />

        {/* ================= FORM VALIDATION EXAMPLE ================= */}
        <section>
          <Heading level={2} className="mb-4">
            🧩 Form Validation (React Hook Form + Zod)
          </Heading>

          <Card variant="elevated" className="max-w-2xl">
            <CardHeader>
              <CardTitle>Login Form Example</CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-4">
              <Input
                label="Email"
                placeholder="example@email.com"
                leftIcon={<Mail size={16} />}
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label="Mật khẩu"
                type="password"
                leftIcon={<Lock size={16} />}
                {...register("password")}
                error={errors.password?.message}
              />
              <Button type="submit" fullWidth loading={isSubmitting}>
                Đăng nhập
              </Button>
            </form>

            <CardFooter>
              <Text muted className="text-center w-full">
                Bạn chưa có tài khoản?{" "}
                <Button variant="ghost" size="sm">
                  Đăng ký ngay
                </Button>
              </Text>
            </CardFooter>
          </Card>
        </section>
        <Divider />

        {/* ================= GRID SYSTEM ================= */}

        <section>
          <Heading level={2} className="mb-4">
            🟢 Grid System
          </Heading>

          {/* Basic Grid */}
          <Text muted className="mb-2">
            Grid cơ bản (3 cột, gap=md):
          </Text>
          <Grid cols={3} gap="md" className="mb-6">
            <GridItem className="bg-blue-100 p-4 text-center rounded">Item 1</GridItem>
            <GridItem className="bg-blue-200 p-4 text-center rounded">Item 2</GridItem>
            <GridItem className="bg-blue-300 p-4 text-center rounded">Item 3</GridItem>
          </Grid>

          {/* Responsive Grid */}
          <Text muted className="mb-2">
            Grid responsive (1 cột mobile → 3 cột desktop):
          </Text>
          <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap="lg" className="mb-6">
            <GridItem className="bg-green-100 p-4 text-center rounded">A</GridItem>
            <GridItem className="bg-green-200 p-4 text-center rounded">B</GridItem>
            <GridItem className="bg-green-300 p-4 text-center rounded">C</GridItem>
          </Grid>

          {/* GridItem span */}
          <Text muted className="mb-2">
            GridItem colSpan & rowSpan:
          </Text>
          <Grid cols={4} gap="sm" className="mb-6">
            <GridItem colSpan={2} className="bg-purple-200 p-4 text-center rounded">
              colSpan=2
            </GridItem>
            <GridItem className="bg-purple-300 p-4 text-center rounded">Normal</GridItem>
            <GridItem className="bg-purple-400 p-4 text-center rounded">Normal</GridItem>
            <GridItem rowSpan={2} className="bg-purple-500 p-4 text-center rounded">
              rowSpan=2
            </GridItem>
            <GridItem className="bg-purple-600 p-4 text-center rounded">Bottom</GridItem>
            <GridItem className="bg-purple-700 p-4 text-center rounded">Bottom</GridItem>
          </Grid>

          {/* Responsive GridItem */}
          <Text muted className="mb-2">
            GridItem responsive (colSpan khác nhau):
          </Text>
          <Grid cols={3} gap="md">
            <GridItem
              responsive={{ sm: { colSpan: 3 }, md: { colSpan: 1 } }}
              className="bg-red-200 p-4 text-center rounded">
              Full width on sm, 1 col on md+
            </GridItem>
            <GridItem className="bg-red-300 p-4 text-center rounded">Item 2</GridItem>
            <GridItem className="bg-red-400 p-4 text-center rounded">Item 3</GridItem>
          </Grid>
        </section>
        {/* ================= RADIO GROUP ================= */}
        <section>
          <Heading level={2} className="my-4">
            🔘 Radio Group
          </Heading>

          <Text muted className="mb-3">
            Component chọn 1 giá trị (radio), có thể dùng cho giao hàng, thanh toán, v.v.
          </Text>
          <div className="space-y-4">
            <RadioGroup name="shipping" options={options} value={selected} onChange={setSelected} />
            <Text muted className="mt-2">
              Bạn đã chọn: <strong>{selected}</strong>
            </Text>
          </div>
        </section>

        <Divider />

        {/* ================= DROPDOWN ================= */}
        <section>
          <Heading level={2} className="my-4">
            🟣 Dropdown
          </Heading>

          <div className="space-y-4">
            <Dropdown
              label="Chọn loại giao hàng"
              placeholder="Select shipping option"
              value={selected}
              onChange={setSelected}
              options={[
                { label: "Giao tiêu chuẩn", value: "standard", icon: <Truck size={16} /> },
                { label: "Giao nhanh", value: "express", icon: <Zap size={16} /> },
                { label: "Nhận tại cửa hàng", value: "pickup", icon: <Store size={16} /> },
              ]}
            />

            <Text muted>
              Bạn đã chọn: <strong>{selected}</strong>
            </Text>
          </div>
        </section>

        <Divider />

        {/* ================= PRICE RANGE SLIDER ================= */}
        <section>
          <Heading level={2} className="mb-4">
            💰 Price Range Slider
          </Heading>

          <div className="max-w-2xl">
            <PriceRangeSlider
              min={0}
              max={50000000}
              step={500000}
              value={[priceMin, priceMax]}
              onChange={(v) => {
                setPriceMin(v[0]);
                setPriceMax(v[1]);
              }}
            />

            {/* <div className="grid grid-cols-2 gap-3 mt-4">
              <Input
                label="Giá từ"
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
              />
              <Input
                label="Giá đến"
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
              />
            </div> */}
          </div>
        </section>
      </Container>
    </main>
  );
}
